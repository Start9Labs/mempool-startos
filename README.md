<p align="center">
  <img src="icon.svg" alt="Mempool Logo" width="21%">
</p>

# Mempool on StartOS

> Everything not listed in this document should behave the same as upstream
> Mempool. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Mempool](https://github.com/mempool/mempool) is a mempool visualizer, block explorer, and fee-market API. On StartOS it runs entirely against your own Bitcoin node and your own Electrum indexer, with every external data source that upstream reaches for either disabled or optional.

- **Upstream repo:** <https://github.com/mempool/mempool>
- **Wrapper repo:** <https://github.com/Start9Labs/mempool-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Three upstream images, unmodified, run as three daemons in a fixed order.

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Images        | `mempool/frontend`, `mempool/backend`, `mariadb` |
| Architectures | x86_64, aarch64                                  |

| Subcontainer          | Daemon    | Starts after | Purpose                                      |
| --------------------- | --------- | ------------ | -------------------------------------------- |
| `mariadb-sub`         | `mariadb` | —            | The bundled database, bound to loopback      |
| `backend-api`         | `api`     | `mariadb`    | The indexer and API — the one to `attach` to |
| `user-interface`      | `webui`   | `api`        | The web frontend, which proxies the API      |
| `clear-backend-cache` | —         | —            | Temporary; the Clear Backend Cache action    |

**The backend does not run the image's entrypoint directly.** It runs a short shell guard first, then execs node. The guard writes a sentinel file into the cache directory on every start and the API health check removes it on the first healthy report; if the sentinel is still there at the next start, the previous start never became healthy, so the guard wipes the on-disk cache before starting. That breaks the boot loop where an oversized cache exhausts the heap while loading, over and over.

The heap ceiling itself is computed at every start rather than fixed. It takes the RAM StartOS grants the container, subtracts 6 GB for the co-resident stack (Bitcoin, the indexer, any Lightning node), and takes a third of the remainder — half, with any indexing toggle on, since the working set is larger. It is a ceiling and not a reservation: raising it does not increase steady-state memory, it only lets a transient startup peak finish.

## Volume and Data Layout

Five volumes are declared and four carry data.

| Volume    | Mount Point                                    | Purpose                                      |
| --------- | ---------------------------------------------- | -------------------------------------------- |
| `config`  | `/backend/mempool-config.json`, read-only file | The upstream configuration file              |
| `cache`   | `/backend/cache`                               | The backend's mempool and RBF disk cache     |
| `db`      | `/var/lib/mysql` in `mariadb-sub`              | The MariaDB data directory                   |
| `startos` | — (host side)                                  | `store.json`; never mounted into a container |
| `main`    | — (unused)                                     | Retained only for the 3.3.1:3 migration path |

`config` is mounted **as a single read-only file**, not as a directory, so the backend can read its configuration but cannot rewrite it — every change goes through the package.

## File Models

Two models: upstream's configuration file, and a small store for state that has no place in it.

| File                  | Volume    | Format | Modelled                | Written by                             |
| --------------------- | --------- | ------ | ----------------------- | -------------------------------------- |
| `mempool-config.json` | `config`  | JSON   | Yes — `FileHelper.json` | Install, every init, and three actions |
| `store.json`          | `startos` | JSON   | Yes — `FileHelper.json` | The Select Indexer action              |

`store.json` holds only which Electrum indexer you selected. It is StartOS state — the discriminator that decides which optional dependency exists — and deliberately not part of upstream's file.

Within `mempool-config.json`:

**Enforced** — rewritten to a fixed value whenever the package writes the file: the whole `DATABASE` section bar the password (the bundled MariaDB on loopback), `MEMPOOL.BACKEND`, `CORE_RPC.COOKIE_PATH`, LND's certificate and macaroon paths, Core Lightning's socket path, and the `SYSLOG`, `MAXMIND`, `REDIS`, `REPLICATION`, and `STRATUM` sections, all held off.

**Derived** — written from live addresses by init on every start: `CORE_RPC.HOST`/`PORT`, `ELECTRUM.HOST`/`PORT`, and `LND.REST_API_URL`. Each is a reactive read of the dependency's address over the LXC bridge, so init re-runs and the backend restarts precisely when an address changes — an install, an uninstall, a port change — and not on a routine dependency update. **An absent dependency resolves to nothing and its key is omitted entirely** rather than written as a placeholder that would fail to connect; the write heals when the dependency returns.

**Seeded once** — `DATABASE.PASSWORD`, generated at install for the bundled database.

**Yours** — everything else, including the whole `EXTERNAL_DATA_SERVER` section and the fiat-price settings. Those are seeded with upstream's own values and never re-asserted, so a hand edit survives.

Two defaults depart from upstream's:

| Key                                              | Here               | Upstream in-source | Why                                                                                     |
| ------------------------------------------------ | ------------------ | ------------------ | --------------------------------------------------------------------------------------- |
| `MEMPOOL.POLL_RATE_MS` / `MEMPOOL_BLOCKS_AMOUNT` | 8000 ms / 4 blocks | 2000 ms / 8 blocks | Home hardware is the common case; the Responsive profile restores upstream's values     |
| `MEMPOOL.STDOUT_LOG_MIN_PRIORITY`                | `info`             | `debug`            | Debug is very noisy in normal operation — but see [Actions](#actions) before a backfill |

`SOCKS5PROXY` is present, dormant, and points at loopback. Tor's SOCKS port is not published on the service bridge and Tor is not a dependency here, so enabling it would not currently reach anything.

## Dependencies

Bitcoin is required; the rest are chosen, and each choice changes which dependency exists.

| Dependency               | Kind      | Required                             | Health checks                       |
| ------------------------ | --------- | ------------------------------------ | ----------------------------------- |
| `bitcoind`               | `running` | Always                               | `bitcoind`, `sync-progress`         |
| `fulcrum` _or_ `electrs` | `running` | Whichever the indexer action selects | The indexer's ready and sync checks |
| `lnd` _or_ `c-lightning` | `running` | Only with Lightning enabled          | The node's ready and sync checks    |

**Bitcoin must be archival with transaction indexing.** Mempool raises a `critical` task against Bitcoin asking for `prune=0` and `txindex=true`, and that task re-raises whenever the settings stop matching — it is not a one-time prompt. Address lookups additionally need an Electrum indexer, which is what the indexer selection is for.

Bitcoin's data directory is mounted read-only so the backend can read its RPC cookie; the chosen Lightning node's is mounted read-only for LND's macaroon and certificate, or Core Lightning's RPC socket. No credential is stored in this package.

## Network Access and Interfaces

One interface. The frontend serves it and reverse-proxies the API and websocket to the backend, so the backend's own port is not published.

| Interface | Id      | Type | Port | Description                  |
| --------- | ------- | ---- | ---- | ---------------------------- |
| Web UI    | `webui` | ui   | 8080 | The web interface of Mempool |

The port is bound on the `main` MultiHost and is not masked. Other packages resolve that host over the bridge — Am I Exposed does exactly this.

## Installation and First-Run Flow

Install generates the database password and raises two `critical` tasks: choose an indexer, and configure Bitcoin for archival mode with transaction indexing. Nothing else is required, and no credential is shown — Mempool has no accounts.

The order that matters: Bitcoin must be synced, and the indexer must have finished its own initial index, before Mempool shows a complete picture. Until then the API is up but blocks and addresses are missing. Mempool itself has no separate sync of its own to wait for unless you enable indexing.

## Actions

Four actions, all user-facing.

### Select Indexer

Chooses which Electrum server backs address lookups — Fulcrum or Electrs.

- **What it changes:** `indexer` in `store.json`, and through it the package's optional dependency. The address itself is resolved by init on the next start.
- **Cost:** seconds, then a restart.
- **Repeat safety:** idempotent; switching indexers loses nothing, since neither stores Mempool's data.

### Enable Lightning

Selects the Lightning node whose network data fills the Lightning tab, or turns the tab off.

- **What it changes:** the `LIGHTNING` section, plus the paths for whichever node was picked; the frontend also gets `LIGHTNING=true`.
- **Cost:** seconds, then a restart.
- **Repeat safety:** idempotent, and nothing is deleted when it is switched off.
- **This is the memory-hungry option.** Lightning graph data is large; on a device under 12 GiB the form warns before you commit.

### Indexing and Performance

The tuning form: a performance profile, mempool statistics, the log level, and four indexing toggles.

- **What it changes:** the corresponding keys in the `MEMPOOL` and `STATISTICS` sections.
- **Cost:** seconds for the write and the restart — but **enabling any indexing toggle starts a historical backfill that can run for many hours and consume significant disk space.**
- **Repeat safety:** idempotent as a write; turning an indexing toggle back off does not undo a backfill already done.
- **The backfill looks like nothing is happening.** Upstream logs per-block progress at debug priority only, so at the default log level the service log sits idle for hours while the backfill runs. The service announces this at every start with indexing on, and the form's Log Level control is what surfaces the progress. Restarting the service interrupts the backfill and delays completion. Intermittent 503 retries from Bitcoin during it are expected.
- **Block Audit requires Block Summaries Indexing**, which the form's descriptions state but does not enforce.

### Clear Backend Cache

Deletes the backend's on-disk mempool and RBF cache.

- **When to run it:** when the backend fails to start with a JavaScript heap out-of-memory error while loading its cache. The boot guard does this automatically after a failed start; this action is the manual route.
- **What it changes:** nothing in configuration — only the `cache` volume's contents.
- **Cost:** seconds, then a short mempool resync on the next start. Blocks, the database, and settings are untouched.
- **Availability: only while the service is stopped.** Clearing the cache under a running backend would race its periodic cache writes.

## Tasks

Two tasks, both raised at install and both `critical`.

| Task                     | On           | Raised when                                              | Cleared when             |
| ------------------------ | ------------ | -------------------------------------------------------- | ------------------------ |
| Select Indexer           | This package | At install                                               | The action runs          |
| Bitcoin's Auto-Configure | `bitcoind`   | Bitcoin's settings are not `prune=0` with `txindex=true` | Bitcoin's settings match |

Both are `critical` because Mempool is not functional without them: no indexer means no address lookups, and a pruned or unindexed node cannot answer the historical queries the explorer is built on.

The Bitcoin task is the one to know about. It is registered with `once: false`, so it comes back if Bitcoin's configuration later stops matching — for example after restoring Bitcoin from a backup taken with pruning on.

## Health Checks

Three checks, one per daemon, and their ordering carries meaning.

| Check     | Displayed       | Method                           | Grace |
| --------- | --------------- | -------------------------------- | ----- |
| `mariadb` | Hidden          | The image's own `healthcheck.sh` | 2 min |
| `api`     | "API"           | Port 8999 is listening           | 45 s  |
| `webui`   | "Web Interface" | Port 8080 is listening           | —     |

The database check reports `loading` rather than failing while it initialises, so a first start looks like progress. It is not displayed, because a user has nothing to do about it.

**`webui` is gated on `api`**, which makes it a truthful "Mempool is usable" signal rather than a report that a web server is running: the frontend proxies everything to the backend and is useless without it. StartOS holds the frontend while the API is unhealthy and brings it back when the API recovers, and dependent packages rely on that.

An `api` failure after the grace period is most often the backend unable to reach Bitcoin, the indexer, or its own database — the service log names which. Failing repeatedly with a heap out-of-memory message while loading the cache is the case [Clear Backend Cache](#actions) exists for.

## Backups and Restore

Only configuration is backed up — `sdk.Backups.ofVolumes('config', 'startos')`.

- **Included:** `mempool-config.json` with every setting, and `store.json` with the indexer selection.
- **Excluded, deliberately:** the MariaDB volume and the backend cache. Both are derived from Bitcoin and the indexer, and both are rebuilt after a restore. The database in particular grows large enough on an indexed install that dumping it failed outright, and it holds nothing that cannot be re-derived.
- **Restore:** settings come back intact and no task is raised, but **the historical database does not**. If indexing was enabled, the backfill starts over from the beginning on the first start, which takes as long as it took the first time.

## Limitations and Differences

1. **The database is not backed up.** A restore replays settings, not history; any enabled indexing backfills again from scratch.
2. **Bitcoin must be archival with transaction indexing**, enforced by a re-raising `critical` task rather than merely recommended.
3. **An Electrum indexer is required for address lookups**, and which one is a choice with no default until the install task is run.
4. **Indexing is memory-hungry and slow**, and its progress is invisible at the default log level.
5. **Telemetry and the maxmind, syslog, redis, replication, and stratum integrations are held off.**
6. **Acceleration services are off by default**, and the external data servers upstream ships are reachable only over clearnet — the SOCKS5 proxy section is dormant here.
7. **The backend runs as root**, which the boot guard needs in order to clear a cache written by the daemon.
8. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: mempool
image: mempool/backend # plus mempool/frontend and mariadb
architectures:
  - x86_64
  - aarch64
subcontainers:
  - mariadb-sub # the bundled database
  - backend-api # the API/indexer; the one to attach to
  - user-interface # the frontend, proxies the API
  - clear-backend-cache # temporary; the Clear Backend Cache action
volumes:
  config: /backend/mempool-config.json (read-only file mount)
  cache: /backend/cache
  db: /var/lib/mysql (in mariadb-sub)
  startos: host side (store.json)
  main: unused; legacy
file_models:
  - mempool-config.json
  - store.json
startos_managed_env_vars:
  - NODE_OPTIONS # backend heap ceiling, computed per start
  - MARIADB_RANDOM_ROOT_PASSWORD
  - MYSQL_DATABASE
  - MYSQL_USER
  - MYSQL_PASSWORD
  - LIGHTNING # frontend, only when a Lightning node is selected
dependencies:
  - bitcoind # required, running
  - fulcrum # or electrs; whichever the indexer action selects
  - electrs
  - lnd # or c-lightning; only with Lightning enabled
  - c-lightning
interfaces:
  webui: { type: ui, port: 8080 }
actions:
  - select-indexer
  - enable-lightning
  - indexing-and-performance
  - clear-backend-cache # only-stopped
tasks:
  - { action: select-indexer, severity: critical }
  - { action: autoconfig, severity: critical } # on bitcoind; re-raises
health_checks:
  - mariadb # hidden
  - api # displayed "API"
  - webui # displayed "Web Interface"; gated on api
```

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

Three upstream images, unmodified, run as four daemons in a fixed order.

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Images        | `mempool/frontend`, `mempool/backend`, `mariadb` |
| Architectures | x86_64, aarch64                                  |

| Subcontainer          | Daemon    | Starts after       | Purpose                                       |
| --------------------- | --------- | ------------------ | --------------------------------------------- |
| `mariadb-sub`         | `mariadb` | —                  | The bundled database, bound to loopback       |
| `pools-server`        | `pools`   | —                  | The bundled mining-pool snapshot, on loopback |
| `backend-api`         | `api`     | `mariadb`, `pools` | The indexer and API — the one to `attach` to  |
| `user-interface`      | `webui`   | `api`              | The web frontend, which proxies the API       |
| `clear-backend-cache` | —         | —                  | Temporary; the Clear Backend Cache action     |

**The backend does not run the image's entrypoint directly.** It runs a short shell guard first, then execs node. The guard writes a sentinel file into the cache directory on every start and the API health check removes it on the first healthy report; if the sentinel is still there at the next start, the previous start never became healthy, so the guard wipes the on-disk cache before starting. That breaks the boot loop where an oversized cache exhausts the heap while loading, over and over. It says nothing and clears nothing when the cache is already empty, and it does not attribute the failure to memory — a crash loop with any other cause leaves the same sentinel behind, and the guard cannot tell them apart.

**`pools` exists because upstream will not start without mining pool definitions.** The backend exits 1 when it has neither a `pools-v2.json` sha stored in its database nor a reachable source for one, so a database that has not been seeded yet — a fresh install, a restore, or an upstream schema migration that nulled the sha — plus an unreachable source is a permanent boot loop. A snapshot of `pools-v2.json` ships in the package's assets, mounted read-only at `/assets`, and `pools` serves it and a matching one-entry git-tree document on loopback. The sha it reports is the file's git blob hash, which is exactly what `api.github.com` reports for the same bytes, so the local and remote sources agree on when the data has changed.

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
| `store.json`          | `startos` | JSON   | Yes — `FileHelper.json` | The Select Indexer and Tor actions     |

`store.json` holds which Electrum indexer you selected and whether external requests should go over Tor. Both are StartOS state — intent, and the discriminator that decides which optional dependencies exist — and deliberately not part of upstream's file. The addresses that intent resolves to are written into `mempool-config.json` instead, which is what lets the Tor proxy be switched off when Tor is uninstalled without forgetting that you asked for it.

Within `mempool-config.json`:

**Enforced** — rewritten to a fixed value whenever the package writes the file: the whole `DATABASE` section bar the password (the bundled MariaDB on loopback), `MEMPOOL.BACKEND`, `CORE_RPC.COOKIE_PATH`, LND's certificate and macaroon paths, Core Lightning's socket path, and the `SYSLOG`, `MAXMIND`, `REDIS`, `REPLICATION`, and `STRATUM` sections, all held off.

**Derived** — written from live addresses by init on every start: `CORE_RPC.HOST`/`PORT`, `ELECTRUM.HOST`/`PORT`, `LND.REST_API_URL`, `SOCKS5PROXY.HOST`/`PORT`/`ENABLED`, and the two `POOLS_JSON` URLs. Each is a reactive read of the dependency's address over the LXC bridge, so init re-runs and the backend restarts precisely when an address changes — an install, an uninstall, a port change — and not on a routine dependency update. **An absent dependency resolves to nothing and its key is omitted entirely** rather than written as a placeholder that would fail to connect; the write heals when the dependency returns.

**Seeded once** — `DATABASE.PASSWORD`, generated at install for the bundled database.

**Yours** — everything else, including the whole `EXTERNAL_DATA_SERVER` section and the fiat-price settings. Those are seeded with upstream's own values and never re-asserted, so a hand edit survives.

Two defaults depart from upstream's:

| Key                                              | Here               | Upstream in-source | Why                                                                                                                                                  |
| ------------------------------------------------ | ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MEMPOOL.POLL_RATE_MS` / `MEMPOOL_BLOCKS_AMOUNT` | 8000 ms / 4 blocks | 2000 ms / 8 blocks | Home hardware is the common case; the Responsive profile restores upstream's values                                                                  |
| `MEMPOOL.STDOUT_LOG_MIN_PRIORITY`                | `info`             | `debug`            | Debug is very noisy in normal operation — but see [Actions](#actions) before a backfill                                                              |
| `MEMPOOL.EXTERNAL_MAX_RETRY` / `_RETRY_INTERVAL` | 3 / 5 s            | 1 / 0 s            | One attempt made a momentary blip indistinguishable from an outage, and left Tor's per-retry circuit rotation with no second circuit to try          |
| `MEMPOOL.POOLS_JSON_URL` / `_TREE_URL`           | loopback           | GitHub             | The bundled snapshot, so a first start needs no network. Switched back to GitHub when the Tor proxy is on, since a SOCKS proxy cannot reach loopback |

`SOCKS5PROXY` is wired to Tor's SOCKS bridge address (`<osIp>:9050`) and off until you turn it on — see [Route External Requests Over Tor](#actions). While it is off, no `HOST` is written at all rather than a placeholder, because anonymizing traffic must never be dialled at an address that is not Tor.

## Dependencies

Bitcoin is required; the rest are chosen, and each choice changes which dependency exists.

| Dependency               | Kind      | Required                             | Health checks                       |
| ------------------------ | --------- | ------------------------------------ | ----------------------------------- |
| `bitcoind`               | `running` | Always                               | `bitcoind`, `sync-progress`         |
| `fulcrum` _or_ `electrs` | `running` | Whichever the indexer action selects | The indexer's ready and sync checks |
| `lnd` _or_ `c-lightning` | `running` | Only with Lightning enabled          | The node's ready and sync checks    |
| `tor`                    | `running` | Only with the Tor proxy enabled      | `tor`                               |

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

Five actions, all user-facing.

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

### Route External Requests Over Tor

Sends everything Mempool asks of the internet — fiat exchange rates, mining pool updates, and the external data server — through the Tor service on your server.

- **What it changes:** `torProxy` in `store.json`, and through it `SOCKS5PROXY` in `mempool-config.json` and the package's optional Tor dependency. The `POOLS_JSON` URLs move back to GitHub at the same time, because a SOCKS proxy cannot reach the loopback address the bundled snapshot is served on.
- **Cost:** seconds, then a restart. External requests get slower, and upstream raises its own timeout from 10 s to 30 s to suit.
- **Repeat safety:** idempotent, and turning it off restores the local pools source.
- **Tor must be installed and running.** While this is on, Tor is a `running` dependency, so StartOS reports Mempool as unhealthy whenever Tor is missing or stopped — it does not hold the service back from starting. With no address to write, external requests go over clearnet until Tor returns; the dependency status is what makes that visible rather than silent. The setting itself is remembered, so the proxy heals on its own.
- **When it helps:** where an ISP or national firewall blocks the endpoints Mempool reads from, and where the server's own name resolution is unreliable — a SOCKS proxy resolves hostnames at the proxy rather than locally.

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

Four checks, one per daemon, and their ordering carries meaning.

| Check     | Displayed       | Method                           | Grace |
| --------- | --------------- | -------------------------------- | ----- |
| `mariadb` | Hidden          | The image's own `healthcheck.sh` | 2 min |
| `pools`   | Hidden          | Port 8998 is listening           | —     |
| `api`     | "API"           | Port 8999 is listening           | 45 s  |
| `webui`   | "Web Interface" | Port 8080 is listening           | —     |

The database check reports `loading` rather than failing while it initialises, so a first start looks like progress. It is not displayed, because a user has nothing to do about it.

**`webui` is gated on `api`**, which makes it a truthful "Mempool is usable" signal rather than a report that a web server is running: the frontend proxies everything to the backend and is useless without it. StartOS holds the frontend while the API is unhealthy and brings it back when the API recovers, and dependent packages rely on that.

An `api` failure after the grace period is most often the backend unable to reach Bitcoin, the indexer, or its own database — the service log names which. Failing repeatedly with a heap out-of-memory message while loading the cache is the case [Clear Backend Cache](#actions) exists for.

**A name-resolution warning at the top of the log is about the server, not Mempool.** The service resolves one external hostname at every start and logs a warning if it cannot. Mempool keeps working — Bitcoin, the indexer, and the database are all reached by address — but fiat prices go missing and the frontend can fail to start, since its nginx config resolves a `mempool.space` upstream at load time. The fix is on the server: set explicit resolvers under System → DNS. A populated list is not evidence of a working one — a VPN gateway's `DNS =` line becomes the only upstream the container resolver has, and it dies with the tunnel (start-technologies#3603).

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
6. **Acceleration services are off by default.** The external data servers upstream ships go over clearnet unless the Tor proxy action is enabled.
7. **The backend runs as root**, which the boot guard needs in order to clear a cache written by the daemon.
8. **No riscv64 build.** x86_64 and aarch64 only.
9. **Bundled mining pool data goes stale between releases.** The snapshot is imported once, on the first start of an unseeded database; after that upstream's `AUTOMATIC_POOLS_UPDATE` is off, so a newer snapshot in a later package release is logged as available and not applied — the same behaviour a GitHub-sourced install has always had.

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
  - pools-server # serves the bundled pools-v2.json on 127.0.0.1:8998
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
  - tor # only with the Tor proxy enabled
interfaces:
  webui: { type: ui, port: 8080 }
actions:
  - select-indexer
  - enable-lightning
  - indexing-and-performance
  - tor-proxy
  - clear-backend-cache # only-stopped
tasks:
  - { action: select-indexer, severity: critical }
  - { action: autoconfig, severity: critical } # on bitcoind; re-raises
health_checks:
  - mariadb # hidden
  - pools # hidden
  - api # displayed "API"
  - webui # displayed "Web Interface"; gated on api
```

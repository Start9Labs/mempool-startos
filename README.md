<p align="center">
  <img src="icon.svg" alt="Mempool Logo" width="21%">
</p>

# Mempool on StartOS

> **Upstream docs:** <https://mempool.space/docs/>
>
> Everything not listed in this document should behave the same as upstream
> Mempool. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

[Mempool](https://github.com/mempool/mempool) is a fully featured mempool visualizer, blockchain explorer, and API service. It focuses on the emerging transaction fee market to help the transition into a multi-layer Bitcoin ecosystem.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                           |
| ------------- | ----------------------------------------------- |
| Frontend      | `mempool/frontend` (upstream, unmodified)       |
| Backend       | `mempool/backend` (upstream, unmodified)        |
| MariaDB       | `mariadb` (upstream, unmodified)                |
| Architectures | x86_64, aarch64                                 |
| Runtime       | Three containers (Frontend + Backend + MariaDB) |

### Entrypoints

| Container | Entrypoint                                                  | Notes                                                                                                                                                                                                                                      |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend  | Upstream `docker-entrypoint.sh` (via `sdk.useEntrypoint()`) | `LIGHTNING=true` injected when a Lightning node is configured                                                                                                                                                                              |
| Backend   | Custom: `/bin/sh` boot guard, then `node /backend/package/index.js` | Runs as `root`. The boot guard drops the on-disk cache when the previous start never became healthy — breaking a heap-OOM boot loop — then execs node. `NODE_OPTIONS=--max-old-space-size=<dynamic>` — sized to (host RAM − 6 GB reserve for Bitcoin/indexer/LN/OS): 1/3 of the remainder, clamped 2048–8192 MB (a 16 GB host gets ~3.3 GB); with any indexing toggle on, 1/2, clamped 4096–8192 MB |
| MariaDB   | Upstream `docker-entrypoint.sh` (via `sdk.useEntrypoint()`) | `--bind-address=127.0.0.1` enforces loopback-only listener                                                                                                                                                                                 |

## Volume and Data Layout

| Volume   | Mount Point      | Purpose               |
| -------- | ---------------- | --------------------- |
| `main`   | —                | Unused (reserved)     |
| `cache`  | `/backend/cache` | Mempool cache data    |
| `db`     | `/var/lib/mysql` | MariaDB database      |
| `config` | —                | Mempool configuration |
| `startos`| —                | StartOS store (`store.json`) |

StartOS-specific files:

| File                  | Volume   | Purpose                                            |
| --------------------- | -------- | -------------------------------------------------- |
| `mempool-config.json` | `config` | Mempool backend configuration (managed by StartOS) |

## Installation and First-Run Flow

1. Ensure Bitcoin is installed. Mempool creates a critical task on Bitcoin requiring `txindex=true` and pruning to be disabled; the task re-appears any time those conditions stop being met
2. Install Mempool from the StartOS marketplace
3. On install, StartOS creates a **critical task** to select an Electrum indexer for address lookups
4. Mempool will not start until Bitcoin (and the selected indexer, and the Lightning backend if configured) report healthy via their StartOS health checks — see [Health Checks](#health-checks)
5. Optionally run "Enable Lightning" for Lightning network data
6. Optionally run "Indexing and Performance" to change the performance profile, toggle statistics, adjust the service-log level, or opt in to block-summary, goggles, audit, and/or CPFP indexing

On first install, StartOS auto-generates a 22-character MariaDB password and writes it to `mempool-config.json`. The database is localhost-only.

**Install alert:** Previous block fee estimates will show as zero until the service catches up. Lookups may be slow while warming up.

**Update alert:** Mempool reindexes after updates, which can take up to an hour.

## Configuration Management

Mempool is configured via `mempool-config.json`, managed by StartOS.

Dependency network addresses are **resolved over the LXC bridge** at runtime and pinned into the config before the backend starts (see `startos/init/watchHosts.ts`); `.startos` DNS is no longer used in StartOS 2.0. This affects `CORE_RPC.HOST`/`PORT` (bitcoind), `ELECTRUM.HOST`/`PORT` (the selected indexer), and `LND.REST_API_URL` — their stored values are dynamic bridge addresses read reactively from each binding's assigned port, so `watchHosts` re-resolves (and main restarts the backend) only when an address actually changes, never on a routine dependency update. While a dependency is absent its config section is simply left unwritten (the backend cannot dial it and the health checks show it) and heals automatically when the dependency returns.

### Auto-Configured by StartOS

| Setting                           | Value                                | Purpose                                                   |
| --------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `CORE_RPC.HOST` / `.PORT`         | bitcoind's LXC-bridge address        | Bitcoin RPC connection, resolved at runtime               |
| `CORE_RPC.COOKIE`                 | `true`                               | Cookie authentication                                     |
| `CORE_RPC.COOKIE_PATH`            | `/mnt/bitcoind/.cookie`              | Cookie file path                                          |
| `DATABASE.HOST` / `.PORT`         | `127.0.0.1` / `3306`                 | Localhost-only MariaDB sidecar                            |
| `DATABASE.DATABASE` / `.USERNAME` | `mempool` / `mempool`                |                                                           |
| `DATABASE.PASSWORD`               | Auto-generated on install (22 chars) | Written to `mempool-config.json`                          |
| `MEMPOOL.NETWORK`                 | `mainnet`                            | Bitcoin network                                           |
| `MEMPOOL.BACKEND`                 | `electrum`                           | Backend type                                              |
| `SYSLOG.ENABLED`                  | `false`                              | Syslog disabled                                           |
| `MAXMIND.ENABLED`                 | `false`                              | GeoIP disabled                                            |
| `REDIS.ENABLED`                   | `false`                              | Redis disabled                                            |
| `REPLICATION.ENABLED`             | `false`                              | Replication disabled                                      |
| `STRATUM.ENABLED`                 | `false`                              | Stratum disabled                                          |
| `SOCKS5PROXY.HOST` / `.PORT`      | `127.0.0.1` / `9050`                 | SOCKS5 proxy for external onion data servers (disabled by default; `HOST` is a loopback placeholder until Tor SOCKS is bridged) |

### Written by Actions

| Setting                                    | Action                   | Notes                                                         |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------- |
| `store.json` `indexer`                     | Select Indexer           | `fulcrum` or `electrs` — StartOS state on the `startos` volume, not a `mempool-config.json` key; `ELECTRUM.HOST`/`.PORT` (TLS off) are then resolved to that indexer's bridge address at runtime |
| `LIGHTNING.ENABLED` / `.BACKEND`           | Enable Lightning         | Backend is `lnd` or `cln`                                     |
| `LND.TLS_CERT_PATH` / `.MACAROON_PATH`     | Enable Lightning         | Paths under the LND mount                                     |
| `CLIGHTNING.SOCKET`                        | Enable Lightning         | `lightning-rpc` socket under the CLN mount                    |
| `MEMPOOL.POLL_RATE_MS`                     | Indexing and Performance | `8000` (Low-CPU) / `4000` (Balanced) / `2000` (Responsive)    |
| `MEMPOOL.MEMPOOL_BLOCKS_AMOUNT`            | Indexing and Performance | `4` (Low-CPU) / `6` (Balanced) / `8` (Responsive)             |
| `STATISTICS.ENABLED`                       | Indexing and Performance | Default on                                                    |
| `MEMPOOL.BLOCKS_SUMMARIES_INDEXING`        | Indexing and Performance | Default off                                                   |
| `MEMPOOL.GOGGLES_INDEXING`                 | Indexing and Performance | Default off                                                   |
| `MEMPOOL.AUDIT`                            | Indexing and Performance | Default off; requires `BLOCKS_SUMMARIES_INDEXING`             |
| `MEMPOOL.CPFP_INDEXING`                    | Indexing and Performance | Default off                                                   |
| `MEMPOOL.STDOUT_LOG_MIN_PRIORITY`          | Indexing and Performance | Default `info`; set to `debug` to watch indexing backfill progress |

### Bitcoin Requirements

Mempool creates a **critical task** on the Bitcoin dependency that requires:

- `txindex=true` — Transaction indexing must be enabled
- `prune` must be unset — pruning must be disabled

The task re-appears whenever those conditions stop being met.

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose               |
| --------- | ---- | -------- | --------------------- |
| Web UI    | 8080 | HTTP     | Mempool web interface |

The backend API runs on port 8999 internally but is not exposed as a separate interface.

## Actions (StartOS UI)

### Select Indexer

- **Name:** Select Indexer
- **Purpose:** Enable address lookups via an Electrum server instance
- **Visibility:** Enabled
- **Availability:** Any status
- **Inputs:** Select one of: Fulcrum (recommended), Electrs
- **Outputs:** None

Selecting an indexer enables address search and transaction history features. Records the choice as StartOS state in `store.json` (on the `startos` volume, not in `mempool-config.json`); the indexer's `ELECTRUM.HOST`/`.PORT` are then resolved over the LXC bridge at runtime.

### Enable Lightning

- **Name:** Enable Lightning
- **Purpose:** Select the Lightning node used to serve network data to the Lightning tab
- **Visibility:** Enabled
- **Availability:** Any status
- **Inputs:** Select one of: LND, Core Lightning, None
- **Outputs:** None

When enabled, configures the `LIGHTNING` and `LND`/`CLIGHTNING` sections of the configuration and mounts the selected Lightning node's volume.

On hosts with less than ~16 GB of total RAM (threshold: 15 GiB) the action carries a confirmation **warning**: the Lightning network-graph sync is memory-intensive, and running it alongside Bitcoin and an Electrum indexer on a low-memory device can push the system into out-of-memory crashes. It is a warning, not a hard gate — the user can still proceed.

### Indexing and Performance

- **Name:** Indexing and Performance
- **Purpose:** Tune backend CPU/responsiveness, toggle the statistics service, set the service-log level, and opt in to optional indexing features
- **Visibility:** Enabled
- **Availability:** Any status
- **Inputs:**
  - **Performance Profile** — one of `low-cpu` / `balanced` / `responsive`
  - **Enable Statistics** — toggle (default on)
  - **Block Summaries Indexing** — toggle (default off)
  - **Goggles Indexing** — toggle (default off)
  - **Block Audit** — toggle (default off; requires Block Summaries Indexing)
  - **CPFP Indexing** — toggle (default off)
  - **Log Level** — one of `debug` / `info` / `warn` / `err` (default `info`)
- **Outputs:** None

Sets `MEMPOOL.POLL_RATE_MS`, `MEMPOOL.MEMPOOL_BLOCKS_AMOUNT`, `STATISTICS.ENABLED`, `MEMPOOL.BLOCKS_SUMMARIES_INDEXING`, `MEMPOOL.GOGGLES_INDEXING`, `MEMPOOL.AUDIT`, `MEMPOOL.CPFP_INDEXING`, and `MEMPOOL.STDOUT_LOG_MIN_PRIORITY` on the configuration. Changes apply on the next service restart.

**Performance profile.** The Mempool backend recomputes a Rust-based block-template projection on every poll; the cost scales with poll frequency and projection depth, and on healthy nodes this loop is the dominant background CPU consumer. The profile picks both together:

| Preset            | `POLL_RATE_MS` | `MEMPOOL_BLOCKS_AMOUNT` | Notes                                           |
| ----------------- | -------------- | ----------------------- | ----------------------------------------------- |
| Low-CPU (default) | 8000           | 4                       | Recommended for low-power devices               |
| Balanced          | 4000           | 6                       |                                                 |
| Responsive        | 2000           | 8                       | Matches upstream in-source default; highest CPU |

**Statistics.** When on (default, matching upstream), the backend samples mempool throughput at 1 Hz and writes periodic statistics rows to MariaDB to power the dashboard charts. Turning it off stops the sampler and the writes; saves background CPU and disk I/O at the cost of the tx/s + vbytes/s charts.

**Log level.** Sets `MEMPOOL.STDOUT_LOG_MIN_PRIORITY`, the minimum priority the backend writes to stdout (upstream syslog-style priorities; the action exposes the useful `debug` / `info` / `warn` / `err` subset, default `info`). Upstream's in-source default is `debug`; the wrapper keeps `info` for a quiet steady-state log. Switch to `debug` to watch per-block indexing backfill progress (rate, percent complete, elapsed time), then back to `info` afterward — at `debug` the backend is chatty.

**Indexing.** All four indexing toggles are off by default, matching upstream. Enabling any of them triggers a historical backfill on the next service restart, which can take several hours and consume significant disk space.

- **Backfill visibility (issue #63):** Upstream logs per-block backfill progress at `debug` priority only, so at the default `info` log level the service log appears completely idle while a backfill runs — the only `info`+ output is the occasional paired `503` retry error when Bitcoin Core's RPC work queue saturates, which is expected, self-recovering, and non-fatal. To make this legible, the wrapper logs a notice on every start with an indexing feature enabled (a backfill may be in progress; 503 retries are non-fatal; restarting the service interrupts the backfill and delays completion), plus a pointer to the Log Level setting when the level is above `debug`. Do not restart the service because the log looks quiet — watch for the upstream `NOTICE: ... indexing completed` lines instead, or raise the log level.
- **RAM requirement:** The action rejects any submission with at least one indexing toggle on when the host has less than ~16 GB of total RAM (threshold: 15 GiB). Backend indexing competes with Bitcoin's dbcache, the selected Electrum indexer, and any Lightning node, so enabling it on a low-memory device is likely to OOM one of the services in the stack.
- **Heap behavior:** The backend's V8 `--max-old-space-size` ceiling scales with host RAM. It subtracts a 6 GB reserve for the co-resident stack (Bitcoin, the selected indexer, any Lightning node, StartOS) and shares the remainder: with indexing off, 1/3 clamped 2–8 GB (a 16 GB host gets ~3.3 GB, a 32 GB host the 8 GB max); with any indexing toggle on, 1/2 clamped 4–8 GB. This is a ceiling, not a reservation — the backend's steady-state heap sits well under it, so a higher ceiling does not raise normal RAM use, it only lets a transient startup peak (reloading the on-disk mempool/RBF cache) finish instead of crashing with "JavaScript heap out of memory". A cache too large to reload even under the ceiling is handled by the boot guard (see [Clear Backend Cache](#clear-backend-cache)), not by enlarging the heap.

### Clear Backend Cache

- **Name:** Clear Backend Cache
- **Purpose:** Delete the backend's on-disk mempool/RBF cache so it is rebuilt from live data on the next start
- **Visibility:** Enabled
- **Availability:** Only when stopped
- **Inputs:** None
- **Outputs:** Confirmation message

Recovers a backend stuck failing to start with a "JavaScript heap out of memory" error while reloading an oversized cache. Deleting the cache costs only a short mempool resync and recent RBF history; blocks, the MariaDB database, and settings are untouched. `allowedStatuses: only-stopped` avoids racing the backend's own cache writes — stop Mempool, run the action, start it.

**Automatic recovery.** The same clearing happens on its own, without this action. The `api` daemon's command is a `/bin/sh` boot guard that writes a `.starting` sentinel into the cache volume and then execs node; the `api` health check removes the sentinel on the first healthy report. If a start crashes before becoming healthy (the OOM boot-loop case), the sentinel survives, so the next start's guard finds it, clears the cache, and lets node rebuild from live data. A boot loop therefore self-heals within one restart cycle; this action is the manual override.

## Backups and Restore

Backups capture the `config` and `startos` volumes — the generated database password and every Indexer / Lightning / indexing selection. The MariaDB database and the backend disk cache are deliberately excluded: both are derived entirely from Bitcoin, so they are rebuilt after a restore rather than copied.

**Volumes backed up:**

- `config` — Mempool configuration (DB password + user selections)
- `startos` — StartOS state (e.g. the selected indexer in `store.json`)

**NOT included in backup:**

- `db` — MariaDB data; rebuilt by re-indexing from Bitcoin on restore
- `cache` — backend disk cache; rebuilt from live data on the next start
- `main` — unused

**Restore behavior:** The database starts empty and Mempool re-indexes it from Bitcoin. Recent data appears quickly; full historical indexes — mining, hashrate, and any enabled block-summary/audit indexing — backfill over the following hours. The re-index runs against the Bitcoin node's RPC, so expect elevated load until it completes.

The database is not dumped into the backup: a `mysqldump`-based backup exceeds the SDK/StartOS backup timeouts on large indexed installs (a 30 s InnoDB-readiness wait and a ~180 s dump/copy ceiling, neither tunable from the package), and the data is reconstructible from the blockchain regardless.

## Health Checks

| Check             | Method                                          | Grace Period | Messages                                                                        |
| ----------------- | ----------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| **MariaDB**       | `healthcheck.sh --connect --innodb_initialized` | 120 seconds  | (internal, not displayed)                                                       |
| **API**           | Port 8999 listening                             | 45 seconds   | Success: "The API is ready" / Error: "The API is not ready"                     |
| **Web Interface** | Port 8080 listening                             | Default      | Success: "The web interface is ready" / Error: "The web interface is not ready" |

Sync status is no longer checked internally. Mempool gates on its dependencies' own health checks — bitcoind (`bitcoind`, `sync-progress`), the selected indexer (fulcrum `primary`/`sync-progress` or electrs `electrs`/`sync`), and the selected Lightning backend if enabled (lnd `lnd`/`sync-progress` or c-lightning `lightningd`/`check-synced`) — so it will not start until those backends are fully synced and reachable.

## Dependencies

| Dependency     | Required | Version Range     | Health Gate                  | Mounted Volume (Dep Volume → Mount Point) | Purpose                                      |
| -------------- | -------- | ----------------- | ---------------------------- | ----------------------------------------- | -------------------------------------------- |
| Bitcoin        | Yes      | `>=28.4:13`       | `bitcoind`, `sync-progress`  | `main` → `/mnt/bitcoind`                  | Blockchain data via RPC                      |
| Fulcrum        | Optional | `>=2.1.1:6`       | `primary`, `sync-progress`   | None                                      | Address lookups (recommended indexer)        |
| Electrs        | Optional | `>=0.11.1:9`      | `electrs`, `sync`            | None                                      | Address lookups (alternate indexer)          |
| LND            | Optional | `>=0.21.1-beta:0` | `lnd`, `sync-progress`       | `main` → `/mnt/lnd` (read-only)           | Lightning Network data (REST API + macaroon) |
| Core Lightning | Optional | `>=26.6.1:2`      | `lightningd`, `check-synced` | `main/bitcoin` → `/mnt/cln` (read-only)   | Lightning Network data (Unix socket)         |

Only one indexer (Electrs or Fulcrum) can be active at a time. Only one Lightning node (LND or CLN) can be active at a time. Optional dependencies are only registered when selected by the corresponding action.

Bitcoin's `.cookie` file at `/mnt/bitcoind/.cookie` is used for RPC authentication.

## Limitations and Differences

1. **Mainnet only** — Testnet, testnet4, signet, regtest, and Liquid not available
2. **No Esplora backend** — Uses Electrum backend only
3. **Single Lightning node** — Cannot use both LND and CLN simultaneously
4. **No MAXMIND geolocation** — GeoIP features disabled
5. **No Redis** — Redis caching not available
6. **No Stratum** — Stratum mining protocol disabled
7. **No Replication** — Database replication disabled
8. **No Accelerator** — Paid transaction acceleration (`MEMPOOL_SERVICES.ACCELERATIONS`) disabled

## What Is Unchanged from Upstream

- Full mempool visualization
- Block explorer functionality
- Transaction lookup and broadcast
- Fee estimation
- Mining pool statistics
- Lightning Network explorer (when enabled)
- Address lookup (when indexer configured)
- Real-time updates via WebSocket
- REST API
- All web UI features

## Contributing

Build and development workflow follow the StartOS packaging guide: <https://docs.start9.com/packaging>. Keep `README.md`, `instructions.md`, and `AGENTS.md` in sync with any change to user-visible behavior or package structure.

---

## Quick Reference for AI Consumers

```yaml
package_id: mempool
upstream_version: see manifest dockerTags
images:
  frontend: mempool/frontend
  backend: mempool/backend
  mariadb: mariadb
architectures: [x86_64, aarch64]
volumes:
  main: (unused)
  cache: /backend/cache
  db: /var/lib/mysql
  config: (mempool-config.json)
  startos: (StartOS state — store.json, selected indexer)
ports:
  ui: 8080
  api: 8999 (internal)
dependencies:
  bitcoind:
    required: true
    version_range: '>=28.4:13'
    required_config: { txindex: true, prune: 0 }
  fulcrum:
    required: false
    version_range: '>=2.1.1:6'
  electrs:
    required: false
    version_range: '>=0.11.1:9'
  lnd:
    required: false
    version_range: '>=0.21.1-beta:0'
  c-lightning:
    required: false
    version_range: '>=26.6.1:2'
startos_managed_env_vars:
  mariadb:
    - MARIADB_RANDOM_ROOT_PASSWORD
    - MYSQL_DATABASE
    - MYSQL_USER
    - MYSQL_PASSWORD
  backend:
    - NODE_OPTIONS
  frontend:
    - LIGHTNING # only set when Enable Lightning action configures a node
actions:
  - select-indexer
  - enable-lightning
  - indexing-and-performance
  - clear-backend-cache
health_checks:
  - mariadb: healthcheck.sh (120s grace)
  - api: port_listening 8999 (45s grace)
  - webui: port_listening 8080
dependency_health_gates:
  - bitcoind: [bitcoind, sync-progress]
  - fulcrum: [primary, sync-progress] # when selected indexer
  - electrs: [electrs, sync] # when selected indexer
  - lnd: [lnd, sync-progress] # when Lightning=lnd
  - c-lightning: [lightningd, check-synced] # when Lightning=cln
backup_strategy: volume backup (config + startos); db + cache rebuilt on restore
```

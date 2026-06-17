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
| Backend   | Custom: `node /backend/package/index.js`                    | Runs as `root`; `NODE_OPTIONS=--max-old-space-size=<dynamic>` — sized to (host RAM − 6 GB reserve for Bitcoin/indexer/LN/OS). Baseline: 1/8 of the remainder, clamped 2048–8192 MB; on hosts with <10 GB total RAM the baseline is pinned to 1024 MB so the backend can't balloon and OOM-kill a sibling. With any indexing toggle on: 1/4, clamped 4096–8192 MB |
| MariaDB   | Upstream `docker-entrypoint.sh` (via `sdk.useEntrypoint()`) | `--bind-address=127.0.0.1` enforces loopback-only listener                                                                                                                                                                                 |

## Volume and Data Layout

| Volume   | Mount Point      | Purpose               |
| -------- | ---------------- | --------------------- |
| `main`   | —                | StartOS state         |
| `cache`  | `/backend/cache` | Mempool cache data    |
| `db`     | `/var/lib/mysql` | MariaDB database      |
| `config` | —                | Mempool configuration |

StartOS-specific files:

| File                  | Volume   | Purpose                                            |
| --------------------- | -------- | -------------------------------------------------- |
| `mempool-config.json` | `config` | Mempool backend configuration (managed by StartOS) |

## Installation and First-Run Flow

1. Ensure Bitcoin Core is installed. Mempool creates a critical task on Bitcoin Core requiring `txindex=true` and pruning to be disabled; the task re-appears any time those conditions stop being met
2. Install Mempool from the StartOS marketplace
3. On install, StartOS creates a **critical task** to select an Electrum indexer for address lookups
4. Mempool will not start until Bitcoin Core (and the selected indexer, and the Lightning backend if configured) report healthy via their StartOS health checks — see [Health Checks](#health-checks)
5. Optionally run "Enable Lightning" for Lightning network data
6. Optionally run "Indexing and Performance" to change the performance profile, toggle statistics, or opt in to block-summary, goggles, audit, and/or CPFP indexing

On first install, StartOS auto-generates a 22-character MariaDB password and writes it to `mempool-config.json`. The database is localhost-only.

**Install alert:** Previous block fee estimates will show as zero until the service catches up. Lookups may be slow while warming up.

**Update alert:** Mempool reindexes after updates, which can take up to an hour.

## Configuration Management

Mempool is configured via `mempool-config.json`, managed by StartOS.

### Auto-Configured by StartOS

| Setting                           | Value                                | Purpose                                                   |
| --------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `CORE_RPC.HOST`                   | `bitcoind.startos`                   | Bitcoin Core connection                                   |
| `CORE_RPC.PORT`                   | `8332`                               | Bitcoin Core RPC port                                     |
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
| `SOCKS5PROXY.HOST` / `.PORT`      | `startos` / `9050`                   | Tor SOCKS proxy (only used if `SOCKS5PROXY.ENABLED=true`) |

### Written by Actions

| Setting                                    | Action                   | Notes                                                         |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------- |
| `ELECTRUM.HOST` / `.PORT` / `.TLS_ENABLED` | Select Indexer           | `fulcrum.startos` or `electrs.startos`, port `50001`, TLS off |
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

### Bitcoin Core Requirements

Mempool creates a **critical task** on the Bitcoin Core dependency that requires:

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

Selecting an indexer enables address search and transaction history features. Sets `ELECTRUM.HOST` and `ELECTRUM.PORT` in the configuration.

### Enable Lightning

- **Name:** Enable Lightning
- **Purpose:** Select the Lightning node used to serve network data to the Lightning tab
- **Visibility:** Enabled
- **Availability:** Any status
- **Inputs:** Select one of: LND, Core Lightning, None
- **Outputs:** None

When enabled, configures the `LIGHTNING` and `LND`/`CLIGHTNING` sections of the configuration and mounts the selected Lightning node's volume.

On hosts with less than ~16 GB of total RAM (threshold: 15 GiB) the action carries a confirmation **warning**: the Lightning network-graph sync is memory-intensive, and running it alongside Bitcoin Core and an Electrum indexer on a low-memory device can push the system into out-of-memory crashes. It is a warning, not a hard gate — the user can still proceed.

### Indexing and Performance

- **Name:** Indexing and Performance
- **Purpose:** Tune backend CPU/responsiveness, toggle the statistics service, and opt in to optional indexing features
- **Visibility:** Enabled
- **Availability:** Any status
- **Inputs:**
  - **Performance Profile** — one of `low-cpu` / `balanced` / `responsive`
  - **Enable Statistics** — toggle (default on)
  - **Block Summaries Indexing** — toggle (default off)
  - **Goggles Indexing** — toggle (default off)
  - **Block Audit** — toggle (default off; requires Block Summaries Indexing)
  - **CPFP Indexing** — toggle (default off)
- **Outputs:** None

Sets `MEMPOOL.POLL_RATE_MS`, `MEMPOOL.MEMPOOL_BLOCKS_AMOUNT`, `STATISTICS.ENABLED`, `MEMPOOL.BLOCKS_SUMMARIES_INDEXING`, `MEMPOOL.GOGGLES_INDEXING`, `MEMPOOL.AUDIT`, and `MEMPOOL.CPFP_INDEXING` on the configuration. Changes apply on the next service restart.

**Performance profile.** The Mempool backend recomputes a Rust-based block-template projection on every poll; the cost scales with poll frequency and projection depth, and on healthy nodes this loop is the dominant background CPU consumer. The profile picks both together:

| Preset            | `POLL_RATE_MS` | `MEMPOOL_BLOCKS_AMOUNT` | Notes                                           |
| ----------------- | -------------- | ----------------------- | ----------------------------------------------- |
| Low-CPU (default) | 8000           | 4                       | Recommended for low-power devices               |
| Balanced          | 4000           | 6                       |                                                 |
| Responsive        | 2000           | 8                       | Matches upstream in-source default; highest CPU |

**Statistics.** When on (default, matching upstream), the backend samples mempool throughput at 1 Hz and writes periodic statistics rows to MariaDB to power the dashboard charts. Turning it off stops the sampler and the writes; saves background CPU and disk I/O at the cost of the tx/s + vbytes/s charts.

**Indexing.** All four indexing toggles are off by default, matching upstream. Enabling any of them triggers a historical backfill on the next service restart, which can take several hours and consume significant disk space.

- **RAM requirement:** The action rejects any submission with at least one indexing toggle on when the host has less than ~16 GB of total RAM (threshold: 15 GiB). Backend indexing competes with Bitcoin Core's dbcache, the selected Electrum indexer, and any Lightning node, so enabling it on a low-memory device is likely to OOM one of the services in the stack.
- **Heap behavior:** When any indexing toggle is on, the backend's V8 heap is raised on the next restart so indexing has room to work. The formula subtracts a 6 GB reserve for the co-resident stack (Bitcoin Core, the selected indexer, any Lightning node, StartOS) and then takes 1/4 of the remainder, clamped 4–8 GB. A 16 GB box gets a 4 GB heap; a 32 GB box gets ~6.5 GB; ≥40 GB gets the 8 GB max. With indexing off, the baseline heap is 1/8 of the remainder clamped 2–8 GB, except on hosts with <10 GB total RAM where it is pinned to 1 GB — on an 8 GB box the 2 GB floor exceeds free RAM and lets the backend grow until the kernel OOM-kills a sibling service (Fulcrum, in observed reports), so the tighter cap keeps Mempool's footprint bounded.

## Backups and Restore

**Database:** Uses `mysqldump`/`mysql` for MariaDB instead of raw volume rsync. The dump is written directly to the backup target.

**Volumes backed up:**

- `db` — MariaDB data (via mysqldump)
- `cache` — Mempool cache
- `config` — Configuration

**NOT included in backup:**

- `main` volume

**Restore behavior:** All historical data is restored. The database is rebuilt from the dump via `mysql` import. May need time to re-sync recent blocks.

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
| Bitcoin Core   | Yes      | `>=28.3:7`        | `bitcoind`, `sync-progress`  | `main` → `/mnt/bitcoind`                  | Blockchain data via RPC                      |
| Fulcrum        | Optional | `>=2.1.0:7`       | `primary`, `sync-progress`   | None                                      | Address lookups (recommended indexer)        |
| Electrs        | Optional | `>=0.11.1:1`      | `electrs`, `sync`            | None                                      | Address lookups (alternate indexer)          |
| LND            | Optional | `>=0.20.1-beta:1` | `lnd`, `sync-progress`       | `main` → `/mnt/lnd` (read-only)           | Lightning Network data (REST API + macaroon) |
| Core Lightning | Optional | `>=25.12.1:4`     | `lightningd`, `check-synced` | `main/bitcoin` → `/mnt/cln` (read-only)   | Lightning Network data (Unix socket)         |

Only one indexer (Electrs or Fulcrum) can be active at a time. Only one Lightning node (LND or CLN) can be active at a time. Optional dependencies are only registered when selected by the corresponding action.

Bitcoin Core's `.cookie` file at `/mnt/bitcoind/.cookie` is used for RPC authentication.

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

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
  main: (StartOS state)
  cache: /backend/cache
  db: /var/lib/mysql
  config: (mempool-config.json)
ports:
  ui: 8080
  api: 8999 (internal)
dependencies:
  bitcoind:
    required: true
    version_range: '>=28.3:7'
    required_config: { txindex: true, prune: 0 }
  fulcrum:
    required: false
    version_range: '>=2.1.0:7'
  electrs:
    required: false
    version_range: '>=0.11.1:1'
  lnd:
    required: false
    version_range: '>=0.20.1-beta:1'
  c-lightning:
    required: false
    version_range: '>=25.12.1:4'
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
backup_strategy: mysqldump (db) + volume rsync (cache, config)
```

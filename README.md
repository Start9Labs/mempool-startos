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

## Volume and Data Layout

| Volume   | Mount Point      | Purpose               |
| -------- | ---------------- | --------------------- |
| `main`   | —                | StartOS state         |
| `cache`  | `/backend/cache` | Mempool cache data    |
| `db`     | `/var/lib/mysql` | MariaDB database      |
| `config` | —                | Mempool configuration |

StartOS-specific files:

| File                                 | Volume   | Purpose                                    |
| ------------------------------------ | -------- | ------------------------------------------ |
| `mempool-config.json`                | `config` | Mempool backend configuration (managed by StartOS) |

## Installation and First-Run Flow

1. Ensure Bitcoin Core is installed (will be auto-configured with `txindex=true` and `prune=0`)
2. Install Mempool from the StartOS marketplace
3. On install, StartOS creates a **critical task** to select an Electrum indexer for address lookups
4. Wait for Bitcoin Core to sync and enable txindex
5. Optionally run "Enable Lightning" for Lightning network data

**Install alert:** Previous block fee estimates will show as zero until the service catches up. Lookups may be slow while warming up.

**Update alert:** Mempool reindexes after updates, which can take up to an hour.

## Configuration Management

Mempool is configured via `mempool-config.json`, managed by StartOS.

### Auto-Configured by StartOS

| Setting           | Value              | Purpose                 |
| ----------------- | ------------------ | ----------------------- |
| `CORE_RPC.HOST`   | `bitcoind.startos` | Bitcoin Core connection |
| `CORE_RPC.PORT`   | `8332`             | Bitcoin Core RPC port   |
| `CORE_RPC.COOKIE` | `true`             | Cookie authentication   |
| `CORE_RPC.COOKIE_PATH` | `/mnt/bitcoind/.cookie` | Cookie file path |
| `DATABASE.*`      | Auto-configured    | MariaDB connection (localhost, port 3306, auto-generated password) |
| `MEMPOOL.NETWORK` | `mainnet`          | Bitcoin network         |
| `MEMPOOL.BACKEND` | `electrum`         | Backend type            |
| `SYSLOG.ENABLED`  | `false`            | Syslog disabled         |
| `MAXMIND.ENABLED` | `false`            | GeoIP disabled          |
| `REDIS.ENABLED`   | `false`            | Redis disabled          |
| `REPLICATION.ENABLED` | `false`        | Replication disabled    |
| `STRATUM.ENABLED` | `false`            | Stratum disabled        |
| `SOCKS5PROXY.HOST` | `startos`         | Tor SOCKS proxy         |
| `SOCKS5PROXY.PORT` | `9050`            | Tor SOCKS proxy port    |

### Bitcoin Core Requirements

StartOS automatically configures Bitcoin Core with:

- `txindex=true` — Transaction indexing enabled
- `prune=0` — Pruning disabled

These are required for Mempool to function.

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

| Check                  | Method                                          | Grace Period | Messages                                              |
| ---------------------- | ----------------------------------------------- | ------------ | ----------------------------------------------------- |
| **MariaDB**            | `healthcheck.sh --connect --innodb_initialized` | 120 seconds  | (internal, not displayed)                             |
| **API**                | Port 8999 listening                             | 45 seconds   | Success: "The API is ready" / Error: "The API is not ready" |
| **Transaction Indexer** | Bitcoin Core `getindexinfo` + `getblockchaininfo` RPC | Default | Loading: "Initial blockchain download still in progress" / Loading: "Transaction Indexer is still syncing" / Success: "Fully synced" |
| **Web Interface**      | Port 8080 listening                             | Default      | Success: "The web interface is ready" / Error: "The web interface is not ready" |

## Dependencies

| Dependency     | Required | Mounted Volume                     | Purpose                       | Auto-Config           |
| -------------- | -------- | ---------------------------------- | ----------------------------- | --------------------- |
| Bitcoin Core   | Yes      | `main` → `/mnt/bitcoind`          | Blockchain data via RPC       | txindex=true, prune=0 |
| Electrs        | Optional | None                               | Address lookups (via action)  | Connects on port 50001 |
| Fulcrum        | Optional | None                               | Address lookups (via action, recommended) | Connects on port 50001 |
| LND            | Optional | `main` → `/mnt/lnd-readonly`      | Lightning data (via action)   | REST API + macaroon   |
| Core Lightning | Optional | `bitcoin` → `/mnt/cln` (read-only)| Lightning data (via action)   | Unix socket           |

Only one indexer (Electrs or Fulcrum) can be active at a time. Only one Lightning node (LND or CLN) can be active at a time.

Bitcoin Core's `.cookie` file at `/mnt/bitcoind/.cookie` is used for RPC authentication.

## Limitations and Differences

1. **Mainnet only** — Testnet and other networks not available
2. **No Esplora backend** — Uses Electrum backend only
3. **Single indexer** — Cannot use both Electrs and Fulcrum simultaneously
4. **Single Lightning node** — Cannot use both LND and CLN simultaneously
5. **No MAXMIND geolocation** — GeoIP features disabled
6. **No Redis** — Redis caching not available
7. **No Stratum** — Stratum mining protocol disabled
8. **No Replication** — Database replication disabled

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
  - bitcoind (required, auto-config: txindex=true, prune=0)
  - electrs (optional)
  - fulcrum (optional)
  - lnd (optional)
  - c-lightning (optional)
actions:
  - select-indexer
  - enable-lightning
health_checks:
  - mariadb: healthcheck.sh (120s grace)
  - api: port_listening 8999 (45s grace)
  - sync: txindex sync status
  - webui: port_listening 8080
backup_strategy: mysqldump (db) + volume rsync (cache, config)
```

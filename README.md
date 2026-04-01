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
- [Dependencies](#dependencies)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                           |
| ------------- | ----------------------------------------------- |
| Frontend      | `mempool/frontend`                              |
| Backend       | `mempool/backend`                               |
| MariaDB       | `mariadb`                                       |
| Architectures | x86_64, aarch64                                 |
| Runtime       | Three containers (Frontend + Backend + MariaDB) |

All images are upstream unmodified.

---

## Volume and Data Layout

| Volume   | Mount Point      | Purpose               |
| -------- | ---------------- | --------------------- |
| `cache`  | `/backend/cache` | Mempool cache data    |
| `db`     | `/var/lib/mysql` | MariaDB database      |
| `config` | —                | Mempool configuration |
| `main`   | —                | StartOS state         |

---

## Installation and First-Run Flow

| Step         | Upstream                      | StartOS                               |
| ------------ | ----------------------------- | ------------------------------------- |
| Installation | Docker Compose setup          | Install from marketplace              |
| Bitcoin Core | Manual configuration          | Auto-configured (txindex, no pruning) |
| Database     | Manual MariaDB setup          | Automatic                             |
| Indexer      | Manual Electrum configuration | Select via action                     |

**First-run steps:**

1. Ensure Bitcoin Core is installed (will be auto-configured)
2. Install Mempool from StartOS marketplace
3. Wait for Bitcoin Core to sync and enable txindex
4. Optionally run "Select Indexer" to enable address lookups
5. Optionally run "Enable Lightning" for Lightning network data

**Install alert:** Previous block fee estimates will show as zero until the service catches up. Lookups may be slow while warming up.

**Update alert:** Mempool reindexes after updates, which can take up to an hour.

---

## Configuration Management

### Auto-Configured by StartOS

| Setting           | Value              | Purpose                 |
| ----------------- | ------------------ | ----------------------- |
| `CORE_RPC.HOST`   | `bitcoind.startos` | Bitcoin Core connection |
| `CORE_RPC.COOKIE` | `true`             | Cookie authentication   |
| `DATABASE.*`      | Auto-configured    | MariaDB connection      |
| `MEMPOOL.NETWORK` | `mainnet`          | Bitcoin network         |
| `MEMPOOL.BACKEND` | `electrum`         | Backend type            |

### Bitcoin Core Requirements

StartOS automatically configures Bitcoin Core with:

- `txindex=true` — Transaction indexing enabled
- `prune=0` — Pruning disabled

These are required for Mempool to function.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose                         |
| --------- | ---- | -------- | ------------------------------- |
| Web UI    | 8080 | HTTP     | Mempool web interface           |
| API       | 8999 | HTTP     | Internal API (used by frontend) |

**Access methods (StartOS 0.4.0):**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

---

## Actions (StartOS UI)

### Select Indexer

| Property     | Value                  |
| ------------ | ---------------------- |
| ID           | `select-indexer`       |
| Name         | Select Indexer         |
| Visibility   | Enabled                |
| Availability | Any status             |
| Purpose      | Enable address lookups |

**Options:**

- **Fulcrum** — Recommended, faster address lookups
- **Electrs** — Alternative Electrum server

Selecting an indexer enables address search and transaction history features.

### Enable Lightning

| Property     | Value                     |
| ------------ | ------------------------- |
| ID           | `enable-lightning`        |
| Name         | Enable Lightning          |
| Visibility   | Enabled                   |
| Availability | Any status                |
| Purpose      | Add Lightning Network tab |

**Options:**

- **LND** — Use LND for Lightning data
- **Core Lightning** — Use CLN for Lightning data
- **None** — Disable Lightning features

---

## Dependencies

| Dependency     | Required | Purpose                       | Auto-Config           |
| -------------- | -------- | ----------------------------- | --------------------- |
| Bitcoin Core   | Yes      | Blockchain data               | txindex=true, prune=0 |
| Electrs        | Optional | Address lookups               | Via action            |
| Fulcrum        | Optional | Address lookups (recommended) | Via action            |
| LND            | Optional | Lightning data                | Via action            |
| Core Lightning | Optional | Lightning data                | Via action            |

**Note:** Only one indexer (Electrs or Fulcrum) can be active at a time. Only one Lightning node (LND or CLN) can be active at a time.

---

## Backups and Restore

**Database:** Uses `mysqldump`/`mysql` for MariaDB instead of raw volume rsync. The dump is written directly to the backup target.

**Volumes backed up via rsync:**

- `main` volume — StartOS state
- `cache` volume — Mempool cache
- `config` volume — Configuration

**NOT included in backup:**

- `db` volume — Not rsynced directly; database is captured via `mysqldump`

**Restore behavior:**

- All historical data restored
- Database is rebuilt from dump via `mysql` import
- May need time to re-sync recent blocks

---

## Health Checks

| Check               | Display Name        | Method                                          |
| ------------------- | ------------------- | ----------------------------------------------- |
| MariaDB             | (internal)          | `healthcheck.sh --connect --innodb_initialized` |
| API                 | API                 | Port 8999 listening (45s grace)                 |
| Transaction Indexer | Transaction Indexer | Bitcoin Core txindex sync status                |
| Web Interface       | Web Interface       | Port 8080 listening                             |

**Transaction Indexer messages:**

- Loading: "Initial blockchain download still in progress"
- Loading: "Transaction Indexer is still syncing"
- Success: "Fully synced"

---

## Limitations and Differences

1. **Mainnet only** — Testnet and other networks not available
2. **No Esplora backend** — Uses Electrum backend only
3. **Single indexer** — Cannot use both Electrs and Fulcrum simultaneously
4. **Single Lightning node** — Cannot use both LND and CLN simultaneously
5. **No MAXMIND geolocation** — GeoIP features disabled
6. **No Redis** — Redis caching not available

---

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

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: mempool
images:
  frontend: mempool/frontend
  backend: mempool/backend
  mariadb: mariadb
architectures: [x86_64, aarch64]
volumes:
  cache: /backend/cache
  db: /var/lib/mysql
  config: (mempool-config.json)
  main: (StartOS state)
ports:
  ui: 8080
  api: 8999
dependencies:
  bitcoind:
    required: true
    auto_config: [txindex=true, prune=0]
  electrs: optional (address lookups)
  fulcrum: optional (address lookups, recommended)
  lnd: optional (Lightning data)
  c-lightning: optional (Lightning data)
actions:
  - select-indexer (enabled, any)
  - enable-lightning (enabled, any)
health_checks:
  - mariadb: healthcheck.sh
  - api: port_listening 8999 (45s grace)
  - sync: txindex sync status
  - webui: port_listening 8080
backup_strategy: mysqldump (db) + volume rsync (main, cache, config)
  - config
fixed_config:
  MEMPOOL.NETWORK: mainnet
  MEMPOOL.BACKEND: electrum
  CORE_RPC.HOST: bitcoind.startos
  DATABASE.HOST: 127.0.0.1
not_available:
  - Testnet/Signet networks
  - Esplora backend
  - MAXMIND geolocation
  - Redis caching
  - Multiple indexers
  - Multiple Lightning nodes
```

# Mempool

## Documentation

- [Start9 Bitcoin Guides](https://docs.start9.com/bitcoin-guides/) — archival versus pruned Bitcoin nodes on StartOS, and what a block explorer needs from one.
- [Mempool project README](https://github.com/mempool/mempool/blob/master/README.md) — upstream project overview and installation reference.

## What you get on StartOS

- A **Web UI** interface — the Mempool block explorer, visualizer, fee estimator, and REST/WebSocket API in one site.
- Address lookup powered by a separate StartOS Electrum indexer (Fulcrum or Electrs).
- An optional **Lightning** explorer that pulls network data from a local LND or Core Lightning node.
- A bundled MariaDB sidecar; you do not configure a database.
- Everything needed for a first start bundled in — Mempool never has to reach the internet to come up, and does not contact GitHub at all.

## Getting set up

Mempool needs Bitcoin, an Electrum-style indexer, and (optionally) a Lightning node to be useful. Install dependencies before or alongside Mempool.

1. Install **Bitcoin** if you don't have it. Mempool posts a critical task on Bitcoin requiring `txindex` enabled and pruning disabled, with an autoconfig action attached — accept it. The task re-appears any time those conditions stop being met.
2. Install **Fulcrum** (recommended) or **Electrs**.
3. After installing Mempool, run the **Select Indexer** task that appears for Mempool and pick **Fulcrum** or **Electrs**.
4. Optionally install **LND** or **Core Lightning**, then run **Enable Lightning** and pick the backend you want feeding the Lightning tab.
5. Start Mempool. It will wait until Bitcoin, the selected indexer, and (if enabled) the Lightning backend are healthy and synced.

## Using Mempool

### Web UI

Open the **Web UI** interface to reach Mempool. The home page shows the live mempool, recent blocks, and fee estimates; use the search bar for transactions, blocks, and (once an indexer is selected) addresses. The **Lightning** tab appears when Enable Lightning is configured against a running LND or Core Lightning node. WebSocket and REST API consumers use the same hostname as the Web UI.

### Actions

- **Select Indexer** — switch the Electrum backend between Fulcrum and Electrs. Mempool's dependency set updates accordingly.
- **Enable Lightning** — choose LND, Core Lightning, or none for the Lightning tab's data source. The selected node is mounted read-only. On a low-memory box the form carries a warning: the Lightning network sync is memory-hungry, and turning it on alongside Bitcoin and your indexer can tip such a box into out-of-memory crashes. You can still proceed.
- **Indexing and Performance** — tune backend behavior on a single form:
  - **Performance Profile** — pick **Low-CPU** (default; polls bitcoind every 8s, projects 4 future blocks), **Balanced** (4s / 6 blocks), or **Responsive** (2s / 8 blocks; highest CPU). The Mempool backend rebuilds its block projection on every poll, so this is the main lever for CPU usage on low-power devices.
  - **Enable Statistics** — leave on (default) for the tx/s and vbytes/s dashboard charts; turn off to skip the 1 Hz sampler and periodic MariaDB writes.
  - **Indexing toggles** — **Block Summaries Indexing**, **Goggles Indexing**, **Block Audit** (requires Block Summaries), and **CPFP Indexing**. Each trades disk and CPU for richer block visualizations. Enabling any toggle triggers a historical backfill on the next start that can take several hours. Indexing is memory-hungry — 16 GB of RAM or more is recommended, and on a smaller box the form carries a warning saying so. It does not block you; the other settings on the form are unaffected by it.
- **Route External Requests Over Tor** — send the handful of requests Mempool makes to the internet — fiat exchange rates, mining pool updates, and the external data server — through the **Tor** service on your server instead of over clearnet. Useful if your ISP or country blocks those endpoints, or if your server's own name resolution is unreliable, since a SOCKS proxy looks hostnames up at the proxy rather than locally. **Tor must be installed and running while this is on.** If it is not, Mempool keeps running but shows as unhealthy, and those requests go over clearnet until Tor is back. Turning the setting off puts everything back on clearnet deliberately. Nothing about Bitcoin, your indexer, or the database changes either way — those are always reached directly on your own network.
- **Clear Backend Cache** — delete the backend's on-disk mempool/RBF cache. Use it if the backend is stuck failing to start with a "JavaScript heap out of memory" error while loading its cache. Stop Mempool first; the cache is rebuilt automatically on the next start (a short mempool resync — blocks, database, and settings are untouched). Mempool also does this on its own: if a start crashes before the API becomes healthy, the next start drops the cache and rebuilds from live data, so a boot loop self-heals without you touching anything.

## If your server can't reach the internet

Mempool needs almost nothing from the internet — Bitcoin, your indexer, and the database are all on your own network — so it starts and serves blocks even when your server is cut off, web interface included. One thing does notice: fiat exchange rates go missing.

If that happens, the service log says so in a line at the top of a start. The cause is usually the server rather than Mempool, and the fix is to set explicit DNS servers under **System → DNS**. Don't go by whether the list there looks populated — a VPN or StartTunnel gateway supplies its own resolver, which reaches nothing whenever the tunnel is down or blocked, and your services can be left with that one entry and no fallback while the server itself still resolves fine. If your network blocks the addresses rather than the lookups, **Route External Requests Over Tor** is the other way around it.

## First run and upgrades

- **First run.** When first running Mempool, previous block fee estimates show as zero values until the service catches up. Lookups may be slow or time out while the service is still warming up, or if there are too many other things running on your system.
- **After an update.** Your mempool needs to reindex following an update, which can take up to an hour depending on your hardware.

## Backups

StartOS backs up your Mempool **configuration** — your indexer, Lightning, and indexing selections. Everything Mempool displays is derived from your own Bitcoin node, so the database itself is not copied into the backup; after a restore, Mempool rebuilds it by re-indexing from your node. Recent blocks and fees appear quickly, and full historical charts — mining, hashrate, and any block-summary indexing you enabled — backfill over the next few hours, adding some load on your Bitcoin node while they catch up.

## Limitations

- **Mainnet only.** Testnet, testnet4, signet, regtest, and Liquid are not available.
- **Electrum backend only.** The Esplora backend is not used.
- **One indexer and one Lightning node at a time.** You cannot run Fulcrum and Electrs, or LND and CLN, simultaneously against Mempool.
- **No paid acceleration, no MaxMind GeoIP, no Redis, no Stratum, no replication** — these upstream features are deliberately disabled.
- **Memory.** Mempool runs alongside Bitcoin, an Electrum indexer, and (optionally) a Lightning node, all memory-hungry. The backend's V8 heap ceiling scales with the RAM available to it (a 16 GB box gets ~2.9 GB, more on larger machines) so it has room to reload its cache at startup without a "JavaScript heap out of memory" crash; if the cache is ever too large to reload even so, the backend drops it and rebuilds from live data rather than looping. 16 GB or more is recommended, especially for Lightning or indexing — on an 8 GB box the stack is tight and enabling heavy extras can still trigger out-of-memory crashes.

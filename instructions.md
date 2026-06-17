# Mempool

## Documentation

- [Mempool project README](https://github.com/mempool/mempool/blob/master/README.md) — upstream project overview and installation reference.

## What you get on StartOS

- A **Web UI** interface — the Mempool block explorer, visualizer, fee estimator, and REST/WebSocket API in one site.
- Address lookup powered by a separate StartOS Electrum indexer (Fulcrum or Electrs).
- An optional **Lightning** explorer that pulls network data from a local LND or Core Lightning node.
- A bundled MariaDB sidecar; you do not configure a database.

## Getting set up

Mempool needs Bitcoin Core, an Electrum-style indexer, and (optionally) a Lightning node to be useful. Install dependencies before or alongside Mempool.

1. Install **Bitcoin Core** if you don't have it. Mempool posts a critical task on Bitcoin Core requiring `txindex` enabled and pruning disabled, with an autoconfig action attached — accept it. The task re-appears any time those conditions stop being met.
2. Install **Fulcrum** (recommended) or **Electrs**.
3. After installing Mempool, run the **Select Indexer** task that appears for Mempool and pick **Fulcrum** or **Electrs**.
4. Optionally install **LND** or **Core Lightning**, then run **Enable Lightning** and pick the backend you want feeding the Lightning tab.
5. Start Mempool. It will wait until Bitcoin Core, the selected indexer, and (if enabled) the Lightning backend are healthy and synced.

## Using Mempool

### Web UI

Open the **Web UI** interface to reach Mempool. The home page shows the live mempool, recent blocks, and fee estimates; use the search bar for transactions, blocks, and (once an indexer is selected) addresses. The **Lightning** tab appears when Enable Lightning is configured against a running LND or Core Lightning node. WebSocket and REST API consumers use the same hostname as the Web UI.

### Actions

- **Select Indexer** — switch the Electrum backend between Fulcrum and Electrs. Mempool's dependency set updates accordingly.
- **Enable Lightning** — choose LND, Core Lightning, or none for the Lightning tab's data source. The selected node is mounted read-only. On systems with less than 16 GB of RAM the action shows a warning before enabling: the Lightning network sync is memory-hungry, and turning it on alongside Bitcoin Core and your indexer can tip a low-memory box into out-of-memory crashes.
- **Indexing and Performance** — tune backend behavior on a single form:
  - **Performance Profile** — pick **Low-CPU** (default; polls bitcoind every 8s, projects 4 future blocks), **Balanced** (4s / 6 blocks), or **Responsive** (2s / 8 blocks; highest CPU). The Mempool backend rebuilds its block projection on every poll, so this is the main lever for CPU usage on low-power devices.
  - **Enable Statistics** — leave on (default) for the tx/s and vbytes/s dashboard charts; turn off to skip the 1 Hz sampler and periodic MariaDB writes.
  - **Indexing toggles** — **Block Summaries Indexing**, **Goggles Indexing**, **Block Audit** (requires Block Summaries), and **CPFP Indexing**. Each trades disk and CPU for richer block visualizations. Enabling any toggle triggers a historical backfill on the next start that can take several hours. The action rejects any submission with an indexing toggle on when the device has less than 16 GB of system RAM.

## Limitations

- **Mainnet only.** Testnet, testnet4, signet, regtest, and Liquid are not available.
- **Electrum backend only.** The Esplora backend is not used.
- **One indexer and one Lightning node at a time.** You cannot run Fulcrum and Electrs, or LND and CLN, simultaneously against Mempool.
- **No paid acceleration, no MaxMind GeoIP, no Redis, no Stratum, no replication** — these upstream features are deliberately disabled.
- **Memory.** Mempool runs alongside Bitcoin Core, an Electrum indexer, and (optionally) a Lightning node, all of which are memory-hungry. On an 8 GB system this stack is tight: the backend's heap is capped tighter to leave room, but enabling Lightning and/or other heavy services on the same box can still trigger out-of-memory crashes. 16 GB or more is recommended if you want Lightning or indexing.

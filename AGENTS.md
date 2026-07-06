# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `mempool`.** Three subcontainers run the service: `backend-api` (the mempool backend), `user-interface` (the frontend, which reverse-proxies the API), and `mariadb-sub` (a MariaDB sidecar the backend reaches on `127.0.0.1:3306`). Backups use `sdk.Backups.withMysqlDump`.
- **Dependencies are reached over the LXC bridge, not `.startos` DNS.** `init/watchHosts.ts` resolves bitcoind's RPC, the selected Electrum indexer, and (when LND is the Lightning backend) LND's REST endpoint on the bridge and writes them into `mempool-config.json` before the backend starts. Each address goes through the `bridgeAddress` helper in `startos/utils.ts`, which reads the binding's `net.assignedPort` (never an addressInfo hostname, so a disabled binding like a locked LND doesn't flap) and returns `<osIp>:<port>` as a reactive `.const()` value — so `watchHosts` re-runs, and main restarts the backend, only when an address truly changes, never on a routine dependency update. An absent dependency leaves its config section unwritten (the backend cannot dial it and the health checks show it); it heals when the dependency returns. bitcoind's and LND's host ids and internal ports are imported from `bitcoin-core-startos`/`lnd-startos` (declared deps); electrs and fulcrum are optional non-npm deps, so their host ids (`electrs`→`electrum`, `fulcrum`→`main`) and the plaintext Electrum port `50001` are string literals in `startos/indexer.ts`.
- **The Electrum indexer choice is StartOS state in `store.json`** (`startos` volume, `startos/file-models/store.json.ts`), read by `selectedIndexer` and written by the Select Indexer action — **never** a key in the upstream `mempool-config.json` (`ELECTRUM.HOST` is the same bridge IP whichever indexer is chosen, so it can't carry the choice). `watchHosts` reads the selection, resolves that indexer's bridge address, and writes only the real upstream keys `ELECTRUM.HOST`/`PORT`/`TLS_ENABLED`. Installs predating `store.json` stored the selector as `<indexer>.startos` in `ELECTRUM.HOST`; the `3.3.1:15` migration seeds `store.json` from that legacy value once. The `startos` volume is backed up (`backups.ts`) so the choice survives restore.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach mempool -n backend-api -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — `backend-api`, `user-interface`, or `mariadb-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".

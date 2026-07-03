# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `mempool`.** Three subcontainers run the service: `backend-api` (the mempool backend), `user-interface` (the frontend, which reverse-proxies the API), and `mariadb-sub` (a MariaDB sidecar the backend reaches on `127.0.0.1:3306`). Backups use `sdk.Backups.withMysqlDump`.
- **Dependencies are reached over the LXC bridge, not `.startos` DNS.** `init/watchHosts.ts` resolves bitcoind's RPC, the selected Electrum indexer, and (when LND is the Lightning backend) LND's REST endpoint on the bridge and writes them into `mempool-config.json` before the backend starts — so it re-runs, and main restarts the backend, whenever a resolved address changes. bitcoind's and LND's host/interface ids are imported from `bitcoin-core-startos`/`lnd-startos` (declared deps); electrs and fulcrum are optional non-npm deps, so their ids (`electrs`→host `electrum`, `fulcrum`→host `main`, both interface `main`) are string literals in `startos/indexer.ts`.
- **The Electrum indexer choice lives in `ELECTRUM.INDEXER`**, the stable discriminator read by `dependencies.ts` and the Select Indexer action. It is deliberately separate from `ELECTRUM.HOST`, which now holds the resolved bridge address `watchHosts` fills in. `selectedIndexer` (`startos/indexer.ts`) falls back once to the legacy `<indexer>.startos` value in `ELECTRUM.HOST` for installs upgraded from before the split.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach mempool -n backend-api -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — `backend-api`, `user-interface`, or `mariadb-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".

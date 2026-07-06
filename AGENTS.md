# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `mempool`.** Three subcontainers run the service: `backend-api` (the mempool backend), `user-interface` (the frontend, which reverse-proxies the API), and `mariadb-sub` (a MariaDB sidecar the backend reaches on `127.0.0.1:3306`). Backups use `sdk.Backups.withMysqlDump`.
- **Dependencies are reached over the LXC bridge, not `.startos` DNS.** `init/watchHosts.ts` resolves bitcoind's RPC, the selected Electrum indexer, and (when LND is the Lightning backend) LND's REST endpoint on the bridge and writes them into `mempool-config.json` before the backend starts. Each address goes through the `bridgeAddress` helper in `startos/utils.ts`, which reads the binding's `net.assignedPort` (never an addressInfo hostname, so a disabled binding like a locked LND doesn't flap) and returns `<osIp>:<port>` as a reactive `.const()` value — so `watchHosts` re-runs, and main restarts the backend, only when an address truly changes, never on a routine dependency update. An absent dependency yields a `127.0.0.1` loopback placeholder that heals when the dependency returns. bitcoind's and LND's host ids and internal ports are imported from `bitcoin-core-startos`/`lnd-startos` (declared deps); electrs and fulcrum are optional non-npm deps, so their host ids (`electrs`→`electrum`, `fulcrum`→`main`) and the plaintext Electrum port `50001` are string literals in `startos/indexer.ts`.
- **The Electrum indexer choice lives in `ELECTRUM.INDEXER`**, the stable discriminator read by `dependencies.ts` and the Select Indexer action. It is deliberately separate from `ELECTRUM.HOST`, which holds the resolved bridge address `watchHosts` fills in. Installs from before the `INDEXER` field existed stored the selector as `<indexer>.startos` in `ELECTRUM.HOST`; the `3.3.1:15` migration (`startos/versions/current.ts`) seeds `INDEXER` from that legacy value once, so `selectedIndexer` reads `INDEXER` with no runtime fallback.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach mempool -n backend-api -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — `backend-api`, `user-interface`, or `mariadb-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".

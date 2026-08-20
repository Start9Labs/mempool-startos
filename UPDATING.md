# Updating the upstream version

Mempool ships as two upstream containers (frontend and backend) that share a release tag and must move together, plus a MariaDB sidecar that tracks its own release line.

## Determining the upstream version

### Mempool (frontend + backend)

Both Mempool images are built from a single source repo — [`mempool/mempool`](https://github.com/mempool/mempool) — and are tagged together. Check the latest GitHub release:

```sh
gh release view -R mempool/mempool --json tagName -q .tagName
```

The current pins live in `startos/manifest/index.ts` at `images.frontend.source.dockerTag` and `images.backend.source.dockerTag`. They are always the same tag and are bumped in lockstep.

### MariaDB

The MariaDB sidecar pulls from the [`mariadb`](https://hub.docker.com/_/mariadb) Docker Hub library image. List recent tags:

```sh
curl -fsSL "https://hub.docker.com/v2/repositories/library/mariadb/tags?page_size=20&ordering=last_updated" | jq -r '.results[].name'
```

The current pin lives in `startos/manifest/index.ts` at `images.mariadb.source.dockerTag`. MariaDB has its own cadence and should only move on a deliberate decision.

## Applying the bump

### Mempool (frontend + backend)

In `startos/manifest/index.ts`, set both tags to the new Mempool release (same value in both places):

- `images.frontend.source.dockerTag` → `mempool/frontend:v<new version>`
- `images.backend.source.dockerTag` → `mempool/backend:v<new version>`

Then [refresh the bundled mining pool snapshot](#refreshing-the-bundled-mining-pool-snapshot) — nothing derives it from the image tags, so it moves only when someone moves it.

### MariaDB

In `startos/manifest/index.ts`, set:

- `images.mariadb.source.dockerTag` → `mariadb:<new version>`

## Refreshing the bundled mining pool snapshot

`assets/pools-v2.json` is a vendored copy of [`mempool/mining-pools`](https://github.com/mempool/mining-pools)'s `pools-v2.json`, served on loopback by the `pools` daemon so a first start needs no network. Refresh it alongside an upstream bump, or whenever the pool definitions have moved on:

```sh
curl -fsSL -o assets/pools-v2.json https://raw.githubusercontent.com/mempool/mining-pools/master/pools-v2.json
```

Nothing else to edit — the sha the daemon reports is the file's git blob hash, computed at runtime. Confirm it matches what GitHub serves for the same content:

```sh
git hash-object assets/pools-v2.json
gh api repos/mempool/mining-pools/git/trees/master --jq '.tree[] | select(.path=="pools-v2.json") | .sha'
```

**Check one upstream detail at every version bump.** `backend/src/tasks/pools-updater.ts` installs its SOCKS agent as `httpsAgent` only:

```ts
axiosOptions.httpsAgent = new SocksProxyAgent(socksOptions)
```

Axios picks `httpAgent` for an `http:` URL, so the loopback fetch is exempt from the proxy and keeps working with Tor egress enabled. If a release adds `httpAgent` alongside it — `sync-assets.ts` already sets both — then a fresh install with the Tor action on would try to reach `127.0.0.1` through Tor, fail, and crash-loop on the missing sha. Serving the snapshot over TLS is the fix if that day comes.

A refreshed snapshot only reaches installs whose database has no `pools_json_sha` yet — a fresh install or a restore. Upstream's `AUTOMATIC_POOLS_UPDATE` is off, so an install that already imported pool data logs that an update is available and keeps what it has.

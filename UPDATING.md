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

### MariaDB

In `startos/manifest/index.ts`, set:

- `images.mariadb.source.dockerTag` → `mariadb:<new version>`

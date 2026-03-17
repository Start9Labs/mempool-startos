## How the upstream version is pulled
- dockerTags in `startos/manifest/index.ts`:
  - `mempool/frontend:v<version>`
  - `mempool/backend:v<version>`
- Both must be updated together. Sidecar `mariadb` has its own version.

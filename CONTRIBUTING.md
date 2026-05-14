# Contributing

This repo packages [Mempool](https://github.com/mempool/mempool) for StartOS.

## Documentation — keep it in sync

- **`README.md`** — what this package is and how it's built (image, volumes, interfaces). For developers and AI assistants.
- **`instructions.md`** — the user-facing instructions packed into the `.s9pk` and shown on the **Instructions** tab in StartOS, for the person running the service.
- **`CONTRIBUTING.md`** — this file.
- **`CLAUDE.md`** — operating rules for AI developers working in this repo.

**Any code change that warrants it must update `README.md` and `instructions.md` in the same change** — a new or renamed action, an added or removed volume / port / interface / dependency, a changed default, a new limitation, any altered user-visible behavior. Don't defer: a package that ships with a stale README or stale instructions is not done, even if the code is perfect. Content rules live in the packaging guide: [Writing READMEs](https://docs.start9.com/packaging/writing-readmes.html) and [Writing Service Instructions](https://docs.start9.com/packaging/writing-instructions.html).

## Building

See the [StartOS Packaging Guide](https://docs.start9.com/packaging/) for environment setup, then:

```bash
npm ci    # install dependencies
make      # build the universal .s9pk
```

## Updating the upstream version

Mempool ships as two upstream containers that must move together, plus a MariaDB sidecar that tracks its own release line.

1. Bump both `dockerTag` values in `startos/manifest/index.ts` to the new Mempool release:
   - `images.frontend.source.dockerTag` → `mempool/frontend:v<new version>`
   - `images.backend.source.dockerTag` → `mempool/backend:v<new version>`
   Both must be bumped together; the frontend and backend share a release tag.
2. If MariaDB itself needs a bump, update `images.mariadb.source.dockerTag` independently. MariaDB has its own version cadence and should usually only move on a deliberate decision.
3. Update `version` and `releaseNotes` in the file under `startos/versions/`, renaming it to the new version string. A *new* version file is only needed when the bump carries an `up`/`down` migration, or when you want the old release notes preserved in git history — see [Versions](https://docs.start9.com/packaging/versions.html).
4. Rebuild (`make`), sideload the `.s9pk`, and confirm it starts.
5. Review `README.md` and `instructions.md` for anything the bump changed.

## How to contribute

1. Fork the repository and create a branch from `master`.
2. Make your changes — including the doc updates above.
3. Open a pull request to `master`.

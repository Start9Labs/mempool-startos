# TODO

## Clear the abandoned bitcoind task replay keys

Fold this into the next version that ships — it does not warrant a release of its own.

A task's replay key defaults to `[package-id]:[action-id]`, so each time bitcoind renamed
its config action, this package's next release wrote a **new** key and abandoned the old
one. Nothing rewrites or reaps an abandoned key: it stays in the database still demanding
whatever it last asked for. Keys this package has written:

| Key                     | Written while                    |
| ----------------------- | -------------------------------- |
| `bitcoind:config`       | 2025-06-29 → 2025-12-12          |
| `bitcoind:other-config` | 2025-12-12 → 2026-03-13          |
| `bitcoind:autoconfig`   | 2026-03-13 → now — live, keep it |

The two abandoned keys are harmless _today_ only because they demand the same values the
live one does (`prune: 0, txindex: true`), so satisfying one satisfies all. That is a
coincidence, not a guarantee — change what Mempool asks bitcoind for and the keys become
mutually exclusive, leaving the user ping-ponging between tasks with no way to settle. That
is exactly what happened to datum-gateway, whose stale `bitcoind:other-config` fought its
live `bitcoind:autoconfig` and stopped the service until the key was cleared by hand over
SSH.

In the next version's migration:

```ts
migrations: {
  up: async ({ effects }) => {
    await sdk.action.clearTask(effects, 'bitcoind:config', 'bitcoind:other-config')
  },
},
```

Needs `import { sdk } from '../sdk'` in the version file. `clearTask` is a no-op for a key
that is not present, so ship it unconditionally — there is no need to establish which
servers ever ran an affected build, and doing so is not possible anyway (the GitHub
releases, workflow runs, and S3 objects for that era have all been swept).

Background: the packaging guide, `tasks.md` → "Retiring a replay key".

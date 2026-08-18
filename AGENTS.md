# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **The indexer selection is StartOS state in `store.json`, never a key in `mempool-config.json`.** `ELECTRUM.HOST` resolves to the same bridge IP whichever indexer is chosen, so it cannot carry the choice — that is why the separate store exists. Installs predating it stored the selector as `<indexer>.startos` in `ELECTRUM.HOST` and are seeded once by the `3.3.1:16` migration; don't add a runtime fallback for it.
- **`electrs` and `fulcrum` host ids are string literals on purpose.** They aren't npm dependencies of this package, so `electrs`→`electrum` and `fulcrum`→`main`, plus the plaintext Electrum port, are hard-coded in `startos/utils.ts` rather than imported. Check them against those packages when either changes its interfaces.
- **The boot sentinel is only cleared once the API is actually healthy, and the clear retries on failure.** A sentinel left behind by a successful start would make the next clean restart wipe the cache; a sentinel wrongly removed would let an OOM boot loop continue forever. Both halves matter.
- **The `main` volume is retained solely for the `3.3.1:3` migration path**, which cleans up an old install's `start9/` directory. Don't reuse it for new data, and don't drop it from the manifest.

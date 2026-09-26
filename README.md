# v2

The rebuild of [tjklint.github.io](https://tjklint.github.io), served at
**https://tjklint.github.io/v2/**.

Live: https://tjklint.github.io/v2/

## Stack

Vite, React, TypeScript, Bun, and the OXC toolchain.

| Package                            | Why                                                           |
| ---------------------------------- | ------------------------------------------------------------- |
| `react`, `react-dom`               | The only runtime dependencies                                 |
| `vite`                             | Dev server and build                                          |
| `@vitejs/plugin-react`             | JSX transform and Fast Refresh                                |
| `typescript` (v7)                  | Native Go compiler; `bun run build` runs `tsc --noEmit` first |
| `@types/react`, `@types/react-dom` | Types for the above                                           |
| `oxlint`                           | Linter                                                        |
| `oxfmt`                            | Formatter                                                     |

## Commands

Bun is the package manager, the script runner, and the runtime.

```sh
bun install
bun run dev      # vite dev server
bun run build    # tsc --noEmit && vite build -> dist/
bun run preview  # serve the production build
bun run check    # oxlint + oxfmt --check (also gates CI)
bun run fmt      # oxfmt, writes changes
```

## Layout

```
index.html          Vite entry
vite.config.ts      base: '/v2/' — required for GitHub Pages
.oxlintrc.json      linter config
.oxfmtrc.json       formatter config
src/main.tsx        the entire app
```

## Deploy

Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
runs `bun run check` then `bun run build`, and publishes `dist/` to GitHub
Pages. It runs on `oven-sh/setup-bun` with no Node step at all.

## Notes

See [AGENTS.md](AGENTS.md) for the working agreement and the rules on adding
dependencies.

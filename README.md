# v2

The rebuild of [tjklint.github.io](https://tjklint.github.io), served at
**https://tjklint.github.io/v2/**.

Live: https://tjklint.github.io/v2/

## Stack

Vite, React, TypeScript, Bun. Nothing else.

| Package                            | Why                                                           |
| ---------------------------------- | ------------------------------------------------------------- |
| `react`, `react-dom`               | The only runtime dependencies                                 |
| `vite`                             | Dev server and build                                          |
| `@vitejs/plugin-react`             | JSX transform and Fast Refresh                                |
| `typescript` (v7)                  | Native Go compiler; `bun run build` runs `tsc --noEmit` first |
| `@types/react`, `@types/react-dom` | Types for the above                                           |

## Commands

Bun is the package manager, the script runner, and the runtime.

```sh
bun install
bun run dev      # vite dev server
bun run build    # tsc --noEmit && vite build -> dist/
bun run preview  # serve the production build
```

## Layout

```
index.html          Vite entry
vite.config.ts      base: '/v2/' — required for GitHub Pages
src/main.tsx        the entire app
```

## Deploy

Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
builds and publishes `dist/` to GitHub Pages. It runs on `oven-sh/setup-bun`
with no Node step at all.

## Notes

See [AGENTS.md](AGENTS.md) for the working agreement and the rules on adding
dependencies.

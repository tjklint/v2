# v2

The rebuild of [tjklint.github.io](https://tjklint.github.io), served at
**https://tjklint.github.io/v2/**.

Live: https://tjklint.github.io/v2/

## Stack

Vite, React, TypeScript. Nothing else.

| Package | Why |
| --- | --- |
| `react`, `react-dom` | The only runtime dependencies |
| `vite` | Dev server and build |
| `@vitejs/plugin-react` | JSX transform and Fast Refresh |
| `typescript`, `@types/*` | Typecheck; `pnpm run build` runs `tsc --noEmit` first |

## Commands

```sh
pnpm install
pnpm run dev      # vite dev server
pnpm run build    # tsc --noEmit && vite build -> dist/
pnpm run preview  # serve the production build
```

## Layout

```
index.html          Vite entry
vite.config.ts      base: '/v2/' — required for GitHub Pages
src/main.tsx        the entire app
```

## Deploy

Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
builds and publishes `dist/` to GitHub Pages.

## Notes

See [AGENTS.md](AGENTS.md) for the working agreement and the rules on adding
dependencies.

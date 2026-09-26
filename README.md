# v2

The rebuild of [tjklint.github.io](https://tjklint.github.io), served at
**https://tjklint.github.io/v2/**.

Live: https://tjklint.github.io/v2/

## Stack

Vite, React, TypeScript, Bun, Tailwind, and the OXC toolchain.

| Package                            | Why                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `react`, `react-dom`               | UI                                                                        |
| `zustand`                          | Window state, read by selectors so a drag does not re-render every window |
| `react-draggable`                  | Window dragging across mouse, touch and pen                               |
| `lucide-react`                     | Icons                                                                     |
| `@fontsource-variable/inter`       | UI typeface                                                               |
| `@fontsource/press-start-2p`       | Pixel typeface for the TJOS wordmark                                      |
| `vite`                             | Dev server and build                                                      |
| `@vitejs/plugin-react`             | JSX transform and Fast Refresh                                            |
| `@tailwindcss/vite`                | Tailwind v4, no PostCSS config and no `tailwind.config.js`                |
| `typescript` (v7)                  | Native Go compiler; `bun run build` runs `tsc --noEmit` first             |
| `@types/react`, `@types/react-dom` | Types for React                                                           |
| `oxlint`                           | Linter                                                                    |
| `oxfmt`                            | Formatter                                                                 |

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
index.html                      Vite entry
vite.config.ts                  base: '/v2/' — required for GitHub Pages
.oxlintrc.json                  linter config
.oxfmtrc.json                   formatter config
src/main.tsx                    mounts <Os />
src/styles/index.css            Tailwind v4 @theme tokens, glass utilities
src/components/os/os.tsx        composes wallpaper, header, widgets, windows, taskbar
src/components/wallpaper/       gradient wallpaper
src/components/header/          TJOS wordmark
src/components/widgets/         weather (Open-Meteo) and calendar
src/components/window/          draggable windows and the stacking layer
src/components/taskbar/         taskbar, start menu, Cmd+K search
src/components/apps/            Sites, Terminal, Snake
src/apps/registry.ts            the app registry — add an app here
src/apps/sites.ts               bookmarked sites
src/apps/weather.ts             Open-Meteo request, WMO codes, parsing
src/apps/shell/                 terminal filesystem and commands
src/store/windows.ts            window state
```

Adding an app is one object in `src/apps/registry.ts` plus an entry in
`src/components/apps/app-surface.tsx`. The taskbar, start menu, search
and window layer all read from the registry.

## Deploy

Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
runs `bun run check` then `bun run build`, and publishes `dist/` to GitHub
Pages. It runs on `oven-sh/setup-bun` with no Node step at all.

## Notes

See [AGENTS.md](AGENTS.md) for the working agreement and the rules on adding
dependencies.

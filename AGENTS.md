# Working agreement

## Commits and PRs

- **Multiple commits per PR.** Break work into logical commits — a reviewer should be able to read the diff step by step. One giant commit defeats the point of having history.
- **Never squash.** Do not pass `--squash` to `gh pr merge`, and do not rebase-merge. Merge commits keep the individual commits visible and are what `gh pr merge --merge` produces.
- **Merge the PR when the work is done.** Land it rather than leaving it open for review, unless I ask you to hold. Verify CI is green first.

```sh
git checkout -b feat/short-slug     # one branch, one topic
# ... commit at each logical step ...
git push -u origin feat/short-slug
gh pr create --title "..." --body "..."
gh pr merge <n> --merge            # not --squash
```

When several PRs belong to one piece of work, merge them in order so each builds on the last.

## Keep it minimal

This repo is bare scaffolding on purpose: Vite, React, TypeScript, and nothing else. The entire app is `src/main.tsx`.

- **Add a dependency only after confirming it is needed.** Check whether the platform or an existing package already covers it, and name what you checked.
- No router, no CSS framework, no state library, no component library until something actually requires one. No `src/components/` directory until there is more than one component worth splitting out.
- Prefer the platform: CSS over a preprocessor, `<details>` over a disclosure library, the URL over client-side state.

## Deploy

- The site is served at **https://tjklint.github.io/v2/**, not the root domain. The root domain is a separate repo (`tjklint.github.io`).
- The base path lives in `vite.config.ts` as `base: '/v2/'`. It is not a build env var — do not reintroduce `PUBLIC_URL`.
- `.github/workflows/deploy.yml` builds on push to `main` and publishes `dist/`. If you change the output directory, update the workflow's `path` in the same PR.

## Commands

Bun is the package manager, the script runner, and the runtime. There is no
Node step anywhere in the build.

```sh
bun install
bun run dev      # vite dev server
bun run build    # tsc --noEmit && vite build -> dist/
bun run preview  # serve the production build
```

`bun run build` typechecks first, so a green build means a clean typecheck.

`bun run` substitutes Bun's own runtime for `#!/usr/bin/env node` scripts, so
Vite executes on Bun, not Node. `engines.node` and `.node-version` (Node 24)
still apply to anything that genuinely needs Node — do not treat them as the
build runtime.

That `tsc` is TypeScript 7, the native Go compiler — it is a prebuilt
per-platform binary, not a Node or Bun program, and it takes about 80ms. Do not
swap it back to the 5.x JS implementation; if a type error seems to be
ignored, check that the platform binary actually resolved
(`bun -e "import('typescript/lib/getExePath.js').then(m => console.log(m.default()))"`).

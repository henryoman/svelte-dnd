# svelte-dnd

This repo is split by concern:

- `lib/`
  The publishable drag-and-drop library package.
- `site/`
  The playground and future docs website.

## Root Scripts

```sh
bun run lib:test
bun run lib:check
bun run lib:build

bun run site:dev
bun run site:check
bun run site:build
```

Use `lib/` when working on the package surface and runtime. Use `site/` when working on the playground, docs, and future website work.

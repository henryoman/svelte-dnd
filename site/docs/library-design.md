# Library Design

This package is structured as a small interaction engine for editor-style drag, resize, and drop.

## Priorities

1. Keep drag and resize smooth under load.
2. Treat the live interaction as a preview pass.
3. Commit expensive updates after drop.
4. Keep the hot path independent from Svelte component rerenders.

## Layers

- `src/lib/core`
  The runtime engine, frame loop, and measurement cache.
- `src/lib/editor`
  Editor-specific interaction math such as transform sessions.
- `src/lib/geometry`
  Small geometry and matrix helpers used by the engine.
- `src/lib/svelte/attachments`
  Thin Svelte 5 DOM bindings for registration.
- `src/lib/presets`
  Opinionated entry points for an editor-focused setup.

## Interaction Model

- The document model is the committed source of truth.
- The interaction state is temporary and drives the live preview.
- During pointer movement, the library should prefer transform-only updates on a dedicated layer.
- On commit, the host app can run exact render work, persistence, history, and heavy image updates.

## First Features

- Pointer-driven drag sessions
- Handle-driven resize sessions
- Measurement caching
- Lightweight drop target registration
- Frame-scheduled updates
- Editor-oriented preset API

## Not In Scope Yet

- Full collision engine
- Auto-scroll
- Rotation handles
- Keyboard dragging
- Virtualization

Those should come after the basic editor interaction loop is stable and measurable.

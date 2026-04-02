<div align="center">
  <img src="./logos/logo.png" alt="Svelte-DND logo" width="800" />

[![npm version](https://img.shields.io/npm/v/svelte-dnd?color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/svelte-dnd)
[![Svelte](https://img.shields.io/badge/Svelte-%5E5.54.0-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-%5E2.50.2-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-%5E7.3.1-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Bun](https://img.shields.io/badge/Bun-workspace-000000?logo=bun&logoColor=white)](https://bun.sh)

</div>

`svelte-dnd` is a Svelte 5 drag-and-drop library for editor-style interfaces. It gives you a controller for interaction state plus Svelte attachments for draggable nodes, droppable regions, and resize handles.

It is built for cases like:

- freeform canvases
- visual editors
- movable panels
- resizable cards and blocks

## Installation

`svelte-dnd` has a peer dependency on `svelte@^5`.

Publishing is not live yet.

- Coming soon on npm
- Placeholder package page: `https://coming-soon.invalid/svelte-dnd`

## Quick Start

```svelte
<script lang="ts">
	import {
		createEditorController,
		draggable,
		droppable,
		resizeHandle,
		type CommittedInteraction
	} from 'svelte-dnd';

	const controller = createEditorController({
		initialTransforms: {
			card: { x: 48, y: 48 }
		}
	});

	let commits = $state<CommittedInteraction[]>([]);

	function handleCommit(commit: CommittedInteraction) {
		commits = [commit, ...commits];
	}
</script>

<div class="canvas" {@attach droppable({ controller, id: 'canvas' })}>
	<div
		class="card"
		{@attach draggable({
			controller,
			id: 'card',
			onCommit: handleCommit
		})}
	>
		Drag me

		<button
			type="button"
			class="handle"
			aria-label="Resize card"
			{@attach resizeHandle({
				controller,
				id: 'card',
				handle: 'se',
				onCommit: handleCommit
			})}
		></button>
	</div>
</div>
```

## How It Works

1. Create a controller with `createEditorController(...)`.
2. Register draggable elements with `draggable(...)`.
3. Register drop zones with `droppable(...)`.
4. Add one or more `resizeHandle(...)` attachments when an item should be resizable.
5. Use `onCommit` or `controller.subscribe(...)` to react to completed interactions and live state.

During pointer movement the library maintains preview transforms for immediate visual feedback. On release it commits the interaction and reports the final transform plus the active droppable target, if any.

## Core API

### `createEditorController(options?)`

Creates the controller used by all attachments.

Options:

- `pixelSnap?: boolean`
- `initialTransforms?: Record<string, TransformInput>`

Useful instance methods:

- `subscribe(listener)` for live interaction state
- `getSnapshot()` for current transforms and hover state
- `getTransform(id)` to read the committed transform for a node
- `getLiveTransform(id)` to read the current preview transform during interaction
- `setTransform(id, transform)` to update a node programmatically
- `commitActive()` and `cancelActive()` for manual control

### `draggable(options)`

Makes an element draggable and registers it with the controller.

Options:

- `controller`
- `id`
- `initialTransform?`
- `data?`
- `disabled?`
- `lockAspectRatio?`
- `onCommit?`

### `droppable(options)`

Registers an element as a drop target.

Options:

- `controller`
- `id`
- `data?`

The element receives `data-dnd-over="true"` while it is the active hover target.

### `resizeHandle(options)`

Turns an element into a resize handle for a draggable node.

Options:

- `controller`
- `id`
- `handle: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'`
- `disabled?`
- `lockAspectRatio?`
- `onCommit?`

## Exported Utilities

The package also exports lower-level helpers for custom integrations:

- `createEditorEngine`
- `createDefaultTransform`
- `createEditorPreset`
- `updateTransformSession`
- `identityTransform`
- `transformToCss`
- matrix and rect helpers such as `matrixToCss`, `translateMatrix`, `pointInRect`, and `rectFromDomRect`

## Notes

- The library targets Svelte 5 attachment syntax.
- It is designed around freeform editor interactions rather than sortable-list abstractions.
- The repo includes a demo site, but consumers only need the package exports shown above.

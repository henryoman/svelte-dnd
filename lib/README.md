# svelte-dnd

`svelte-dnd` is a Svelte 5 drag-and-drop library for editor-style UIs. It provides a shared controller plus attachments for draggable elements, droppable regions, and resize handles.

## Install

Publishing is not live yet.

- Coming soon on npm
- Placeholder package page: `https://coming-soon.invalid/svelte-dnd`

`svelte@^5` is required as a peer dependency.

## Quick Start

```svelte
<script lang="ts">
	import { createEditorController, draggable, droppable, resizeHandle } from 'svelte-dnd';

	const controller = createEditorController({
		initialTransforms: {
			card: { x: 48, y: 48 }
		}
	});
</script>

<div {@attach droppable({ controller, id: 'canvas' })}>
	<div {@attach draggable({ controller, id: 'card' })}>
		Drag me
		<button
			type="button"
			aria-label="Resize card"
			{@attach resizeHandle({ controller, id: 'card', handle: 'se' })}
		></button>
	</div>
</div>
```

## Main Exports

- `createEditorController`
- `draggable`
- `droppable`
- `resizeHandle`
- `createEditorEngine`
- `createEditorPreset`
- `transformToCss`

The repository root README contains fuller usage notes and API details.

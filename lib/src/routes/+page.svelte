<script lang="ts">
	import {
		createEditorController,
		draggable,
		droppable,
		resizeHandle,
		type EditorControllerSnapshot
	} from '../lib/index.js';

	const controller = createEditorController({
		pixelSnap: true,
		initialTransforms: {
			photo: { x: 48, y: 52 },
			palette: { x: 300, y: 140, scaleX: 0.92, scaleY: 0.92 },
			badge: { x: 184, y: 258, scaleX: 0.78, scaleY: 0.78 }
		}
	});

	const cards = [
		{
			id: 'photo',
			title: 'Hero image',
			copy: 'Large asset block meant to move first and render exactly after commit.',
			className: 'photo'
		},
		{
			id: 'palette',
			title: 'Palette strip',
			copy: 'Secondary panel that can be nudged or resized without reflowing the whole stage.',
			className: 'palette'
		},
		{
			id: 'badge',
			title: 'Badge',
			copy: 'Small overlay element for fast layering and detail work.',
			className: 'badge'
		}
	] as const;

	let snapshot = $state(controller.getSnapshot() as EditorControllerSnapshot);

	$effect(() => {
		return controller.subscribe((next: EditorControllerSnapshot) => {
			snapshot = next;
		});
	});
</script>

<svelte:head>
	<title>svelte-dnd demo</title>
</svelte:head>

<section class="page">
	<div class="intro">
		<p class="eyebrow">svelte-dnd</p>
		<h1>Preview-first editor drag and resize</h1>
		<p>
			The library now has a real interaction loop: move and resize stay on the fast path, while
			expensive correctness can happen after commit.
		</p>
	</div>

	<div class="layout">
		<div class="stage-shell">
			<div class="stage" {@attach droppable({ controller, id: 'stage' })}>
				{#each cards as card}
					<div
						class={`card ${card.className}`}
						class:active={snapshot.active?.nodeId === card.id}
						{@attach draggable({ controller, id: card.id })}
					>
						<div class="card-copy">
							<h2>{card.title}</h2>
							<p>{card.copy}</p>
						</div>

						<div class="handles">
							<button
								class="handle nw"
								aria-label="Resize from top left"
								{@attach resizeHandle({ controller, id: card.id, handle: 'nw' })}
							></button>
							<button
								class="handle ne"
								aria-label="Resize from top right"
								{@attach resizeHandle({ controller, id: card.id, handle: 'ne' })}
							></button>
							<button
								class="handle se"
								aria-label="Resize from bottom right"
								{@attach resizeHandle({ controller, id: card.id, handle: 'se' })}
							></button>
							<button
								class="handle sw"
								aria-label="Resize from bottom left"
								{@attach resizeHandle({ controller, id: card.id, handle: 'sw' })}
							></button>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<aside class="panel" {@attach droppable({ controller, id: 'inspector' })}>
			<p class="eyebrow">Live State</p>
			<p><strong>Active</strong>: {snapshot.active?.nodeId ?? 'none'}</p>
			<p><strong>Mode</strong>: {snapshot.active?.kind ?? 'idle'}</p>
			<p><strong>Over</strong>: {snapshot.hoveredDroppableId ?? 'none'}</p>
			<ul>
				{#each cards as card}
					<li>
						<strong>{card.id}</strong>
						<span>
							x {Math.round((snapshot.previewTransforms.get(card.id)?.x ?? 0) * 10) / 10}, y
							{Math.round((snapshot.previewTransforms.get(card.id)?.y ?? 0) * 10) / 10}
						</span>
					</li>
				{/each}
			</ul>
		</aside>
	</div>
</section>

<style>
	:global(body) {
		margin: 0;
		font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
		background:
			radial-gradient(circle at top, rgba(237, 209, 180, 0.4), transparent 35%),
			linear-gradient(180deg, #fbf5eb 0%, #f0ece5 100%);
		color: #1f1d1a;
	}

	.page {
		min-height: 100vh;
		padding: 2.5rem;
		display: grid;
		gap: 1.75rem;
	}

	.intro {
		max-width: 52rem;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.78rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #8b5e3c;
	}

	h1 {
		margin: 0 0 0.75rem;
		font-size: clamp(2.4rem, 5vw, 4.5rem);
		line-height: 0.95;
	}

	.intro p:last-child {
		margin: 0;
		max-width: 42rem;
		font-size: 1.05rem;
		line-height: 1.5;
		color: #5d5148;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 18rem;
		gap: 1.25rem;
		align-items: start;
	}

	.stage-shell,
	.panel {
		border: 1px solid rgba(66, 54, 43, 0.12);
		border-radius: 1.5rem;
		background: rgba(255, 255, 255, 0.66);
		backdrop-filter: blur(20px);
		box-shadow: 0 22px 60px rgba(82, 61, 43, 0.12);
	}

	.stage-shell {
		padding: 1rem;
	}

	.stage {
		position: relative;
		min-height: 38rem;
		overflow: hidden;
		border-radius: 1rem;
		background:
			linear-gradient(rgba(141, 112, 83, 0.12) 1px, transparent 1px),
			linear-gradient(90deg, rgba(141, 112, 83, 0.12) 1px, transparent 1px),
			linear-gradient(180deg, #f5eee2 0%, #efe2d0 100%);
		background-size:
			24px 24px,
			24px 24px,
			auto;
	}

	:global(.stage[data-dnd-over='true']),
	:global(.panel[data-dnd-over='true']) {
		box-shadow: inset 0 0 0 2px rgba(191, 115, 67, 0.35);
	}

	.card {
		position: absolute;
		top: 0;
		left: 0;
		width: 220px;
		min-height: 148px;
		padding: 1rem;
		border: 1px solid rgba(31, 29, 26, 0.12);
		border-radius: 1.25rem;
		box-shadow: 0 14px 32px rgba(74, 59, 47, 0.18);
		display: grid;
		align-content: space-between;
		user-select: none;
	}

	.card.active {
		box-shadow:
			0 20px 50px rgba(74, 59, 47, 0.2),
			0 0 0 2px rgba(191, 115, 67, 0.25);
	}

	.photo {
		width: 240px;
		min-height: 180px;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.25)),
			linear-gradient(145deg, #c77444, #f0c49d);
	}

	.palette {
		width: 210px;
		min-height: 132px;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.35)),
			linear-gradient(160deg, #3b525d, #8ea7b2);
		color: #f7fafb;
	}

	.badge {
		width: 180px;
		min-height: 120px;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.35)),
			linear-gradient(145deg, #5d3f86, #d9c7f5);
		color: #241833;
	}

	.card-copy h2 {
		margin: 0 0 0.45rem;
		font-size: 1.05rem;
	}

	.card-copy p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.45;
	}

	.handles {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.handle {
		position: absolute;
		width: 16px;
		height: 16px;
		border: 0;
		border-radius: 999px;
		background: #fff8ef;
		box-shadow: 0 0 0 1px rgba(56, 46, 37, 0.18);
		pointer-events: auto;
	}

	.nw {
		top: -8px;
		left: -8px;
	}

	.ne {
		top: -8px;
		right: -8px;
	}

	.se {
		right: -8px;
		bottom: -8px;
	}

	.sw {
		left: -8px;
		bottom: -8px;
	}

	.panel {
		padding: 1.25rem;
	}

	.panel p,
	.panel li,
	.panel strong,
	.panel span {
		font-size: 0.92rem;
	}

	.panel ul {
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.75rem;
	}

	.panel li {
		padding-top: 0.75rem;
		border-top: 1px solid rgba(66, 54, 43, 0.1);
		display: grid;
		gap: 0.2rem;
	}

	@media (max-width: 900px) {
		.page {
			padding: 1.25rem;
		}

		.layout {
			grid-template-columns: 1fr;
		}

		.stage {
			min-height: 30rem;
		}
	}
</style>

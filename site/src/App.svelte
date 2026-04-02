<script lang="ts">
	import {
		createEditorController,
		draggable,
		droppable,
		resizeHandle,
		type CommittedInteraction,
		type EditorControllerSnapshot
	} from 'svelte-dnd';

	type CardTheme = 'burnt' | 'slate' | 'cream' | 'ink';

	type MotionCard = {
		id: string;
		label: string;
		note: string;
		theme: CardTheme;
		settleMs: number;
		width: number;
		height: number;
	};

	const cards: MotionCard[] = [
		{
			id: 'raw',
			label: 'Raw follow',
			note: 'Clean direct follow with no settle after release.',
			theme: 'burnt',
			settleMs: 0,
			width: 176,
			height: 176
		},
		{
			id: 'snap',
			label: 'Standard box',
			note: 'Reference box for comparing drag feel on the shared board.',
			theme: 'slate',
			settleMs: 0,
			width: 168,
			height: 168
		},
		{
			id: 'settle',
			label: 'Soft settle',
			note: 'Direct while dragging, but eases into place after release.',
			theme: 'cream',
			settleMs: 160,
			width: 182,
			height: 182
		},
		{
			id: 'micro',
			label: 'Micro precision',
			note: 'Smaller box for tighter precision checks.',
			theme: 'ink',
			settleMs: 90,
			width: 116,
			height: 116
		}
	];

	const controller = createEditorController({
		pixelSnap: false,
		initialTransforms: {
			raw: { x: 70, y: 76 },
			snap: { x: 318, y: 128 },
			settle: { x: 560, y: 90 },
			micro: { x: 420, y: 336 }
		}
	});

	let snapshot = $state(controller.getSnapshot() as EditorControllerSnapshot);
	let lockAspectRatio = $state(true);
	let commits = $state<string[]>([]);

	$effect(() => {
		return controller.subscribe((next: EditorControllerSnapshot) => {
			snapshot = next;
		});
	});

	function recordCommit(commit: CommittedInteraction): void {
		commits = [
			`${commit.nodeId} -> ${commit.overId ?? 'none'} at ${Math.round(commit.transform.x)}, ${Math.round(commit.transform.y)}`,
			...commits
		].slice(0, 8);
	}

	function resetLayout(): void {
		controller.setTransform('raw', { x: 70, y: 76 });
		controller.setTransform('snap', { x: 318, y: 128 });
		controller.setTransform('settle', { x: 560, y: 90 });
		controller.setTransform('micro', { x: 420, y: 336 });
		commits = [];
	}
</script>

<svelte:head>
	<title>SVELTE-DND PLAYGROUND</title>
</svelte:head>

<section class="shell">
	<header class="hero">
		<div>
			<p class="eyebrow">SVELTE-DND PLAYGROUND</p>
			<h1>Test the tech</h1>
			<p class="lede">
				Use one shared grid to compare smoothness, snapping, hover handoff, and resize behavior.
				Resize from the bottom-right handle, and use the ratio switch when you want locked
				proportions.
			</p>
		</div>

		<div class="controls">
			<label class="switch">
				<input type="checkbox" bind:checked={lockAspectRatio} />
				<span>Lock all aspect ratios</span>
			</label>
			<button type="button" onclick={resetLayout}>Reset layout</button>
		</div>
	</header>

	<div class="workspace">
		<section class="board-wrap">
			<div class="board" {@attach droppable({ controller, id: 'canvas' })}>
				<div class="board-tag">shared grid</div>

				{#each cards as card}
					{@const transform = snapshot.previewTransforms.get(card.id)}
					<div
						class={`card ${card.theme} ${card.settleMs > 0 ? 'settle' : ''}`}
						class:active={snapshot.active?.nodeId === card.id}
						class:compact={card.width < 140}
						style={`--settle-ms:${card.settleMs}ms; width:${card.width}px; height:${card.height}px;`}
						{@attach draggable({
							controller,
							id: card.id,
							lockAspectRatio,
							onCommit: recordCommit
						})}
						>
						<div class="card-top">
							<p>{card.label}</p>
							<span>{card.width}x{card.height}</span>
						</div>

						<p class="card-note">{card.note}</p>

						<div class="card-meta">
							<span>x {Math.round((transform?.x ?? 0) * 10) / 10}</span>
							<span>y {Math.round((transform?.y ?? 0) * 10) / 10}</span>
						</div>

						<div class="handles">
							<button
								type="button"
								class="handle se"
								aria-label={`Resize ${card.label}`}
								style={`--handle-scale-x:${1 / Math.max(transform?.scaleX ?? 1, 0.001)}; --handle-scale-y:${1 / Math.max(transform?.scaleY ?? 1, 0.001)};`}
								{@attach resizeHandle({
									controller,
									id: card.id,
									handle: 'se',
									onCommit: recordCommit
								})}
							></button>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<aside class="sidebar">
			<section class="panel" {@attach droppable({ controller, id: 'dock' })}>
				<p class="eyebrow">Live state</p>
				<ul>
					<li><strong>active</strong><span>{snapshot.active?.nodeId ?? 'none'}</span></li>
					<li><strong>mode</strong><span>{snapshot.active?.kind ?? 'idle'}</span></li>
					<li><strong>hover</strong><span>{snapshot.hoveredDroppableId ?? 'none'}</span></li>
					<li><strong>ratio</strong><span>{lockAspectRatio ? 'locked' : 'free'}</span></li>
				</ul>
			</section>

			<section class="panel">
				<p class="eyebrow">Boxes</p>
				<ul>
					{#each cards as card}
						<li>
							<strong>{card.label}</strong>
							<span>{card.width} x {card.height}</span>
							<span>{card.settleMs > 0 ? `${card.settleMs}ms settle` : 'no settle'}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section class="panel">
				<p class="eyebrow">Recent drops</p>
				{#if commits.length === 0}
					<p class="empty">Drop boxes around the board to log commits here.</p>
				{:else}
					<ul>
						{#each commits as entry}
							<li>{entry}</li>
						{/each}
					</ul>
				{/if}
			</section>
		</aside>
	</div>
</section>

<style>
	:global(:root) {
		--bg: #efece5;
		--surface: #f8f6f0;
		--surface-strong: #f3f0e9;
		--line: #c9c1b4;
		--line-strong: #9e9485;
		--text: #171512;
		--muted: #5d554c;
		--accent: #9f5930;
		--accent-soft: #e8ddd4;
		--mono: 'IBM Plex Mono', 'SFMono-Regular', 'Menlo', monospace;
		--sans: 'IBM Plex Sans', 'Avenir Next', 'Segoe UI', sans-serif;
		--display: 'Arial Black', 'Avenir Next Condensed', 'Helvetica Neue', sans-serif;
	}

	:global(body) {
		margin: 0;
		font-family: var(--sans);
		background: var(--bg);
		color: var(--text);
	}

	:global(button) {
		font: inherit;
	}

	.shell {
		min-height: 100vh;
		padding: 1.5rem;
		display: grid;
		gap: 1rem;
	}

	.hero,
	.board-wrap,
	.panel {
		border: 1px solid var(--line);
		background: var(--surface);
		box-shadow: none;
	}

	.hero {
		padding: 1.35rem 1.45rem;
		border-radius: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}

	.eyebrow {
		margin: 0 0 0.45rem;
		font-size: 0.74rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #111;
		font-family: var(--mono);
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 4.8vw, 3.4rem);
		line-height: 0.98;
		max-width: 13ch;
		font-family: var(--display);
		font-weight: 900;
		letter-spacing: -0.06em;
	}

	.lede {
		margin: 0.9rem 0 0;
		max-width: 50rem;
		font-size: 0.98rem;
		line-height: 1.5;
		color: var(--muted);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.switch,
	.controls button {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.75rem 0.9rem;
		min-height: 3rem;
		box-sizing: border-box;
		border-radius: 0;
		border: 1px solid var(--line-strong);
		background: var(--surface-strong);
		box-shadow: none;
		font-family: var(--mono);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text);
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}

	.controls button {
		cursor: pointer;
	}

	.controls button:hover,
	.switch:hover {
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.switch input {
		width: 1rem;
		height: 1rem;
		margin: 0;
		flex: 0 0 auto;
		accent-color: #111;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 21rem;
		gap: 1rem;
	}

	.board-wrap {
		padding: 1rem;
		border-radius: 0;
	}

	.board {
		position: relative;
		min-height: 44rem;
		overflow: hidden;
		border-radius: 0;
		border: 1px solid var(--line);
		background:
			linear-gradient(rgba(129, 119, 108, 0.12) 1px, transparent 1px),
			linear-gradient(90deg, rgba(129, 119, 108, 0.12) 1px, transparent 1px), var(--surface);
		background-size:
			24px 24px,
			24px 24px,
			auto;
	}

	:global(.board[data-dnd-over='true']),
	:global(.panel[data-dnd-over='true']) {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
	}

	.board-tag {
		position: absolute;
		top: 0.9rem;
		left: 0.9rem;
		padding: 0.3rem 0.55rem;
		border-radius: 0;
		border: 1px solid var(--line);
		background: var(--surface-strong);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		font-family: var(--mono);
	}

	.card {
		position: absolute;
		top: 0;
		left: 0;
		padding: 1rem;
		border-radius: 0;
		border: 1px solid var(--line-strong);
		box-shadow: none;
		user-select: none;
		outline: 1px solid rgba(23, 21, 18, 0.06);
		outline-offset: -1px;
	}

	.card.settle:not(.active) {
		transition:
			transform var(--settle-ms) cubic-bezier(0.22, 1, 0.36, 1),
			border-color 120ms ease;
	}

	.card.active {
		outline: 2px solid var(--accent);
		outline-offset: -2px;
		border-color: var(--accent);
	}

	.card-top,
	.card-meta {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.card-top p,
	.card-note,
	.card-meta span {
		margin: 0;
	}

	.card-top p {
		font-size: 0.98rem;
		font-family: var(--display);
		font-weight: 900;
		letter-spacing: -0.03em;
	}

	.card-top span,
	.card-meta span {
		font-size: 0.76rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		opacity: 0.9;
		font-family: var(--mono);
	}

	.card-note {
		margin-top: 0.7rem;
		font-size: 0.9rem;
		line-height: 1.42;
		max-width: 22ch;
		color: #3e3831;
	}

	.card-meta {
		margin-top: 1rem;
	}

	.card.compact {
		padding: 0.7rem;
	}

	.card.compact .card-top {
		align-items: start;
	}

	.card.compact .card-top p {
		font-size: 0.78rem;
		line-height: 1.02;
		max-width: 7ch;
	}

	.card.compact .card-top span,
	.card.compact .card-meta span {
		font-size: 0.64rem;
		letter-spacing: 0.08em;
	}

	.card.compact .card-note {
		margin-top: 0.5rem;
		font-size: 0.72rem;
		line-height: 1.28;
		max-width: 14ch;
	}

	.card.compact .card-meta {
		margin-top: 0.75rem;
	}

	.handles {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.handle {
		position: absolute;
		right: -8px;
		bottom: -8px;
		width: 18px;
		height: 18px;
		border: 1px solid var(--line-strong);
		border-radius: 0;
		background: var(--surface);
		box-shadow: none;
		pointer-events: auto;
		transform: scale(var(--handle-scale-x, 1), var(--handle-scale-y, 1));
		transform-origin: center;
	}

	.burnt {
		background: #e8cfbd;
	}

	.slate {
		background: #c5d0d0;
		color: #172126;
	}

	.cream {
		background: #e6d8b7;
	}

	.ink {
		background: #d1ccd8;
		color: #18151f;
	}

	.sidebar {
		display: grid;
		gap: 1rem;
		align-content: start;
	}

	.panel {
		padding: 1.1rem;
		border-radius: 0;
	}

	.panel ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.8rem;
	}

	.panel li {
		padding-top: 0.75rem;
		border-top: 1px solid rgba(53, 41, 33, 0.12);
		display: grid;
		gap: 0.2rem;
	}

	.panel li:first-child {
		padding-top: 0;
		border-top: 0;
	}

	.panel strong {
		font-size: 0.76rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #786c60;
		font-family: var(--mono);
	}

	.panel span,
	.panel li,
	.empty {
		font-size: 0.92rem;
		line-height: 1.4;
	}

	.empty {
		margin: 0;
		color: var(--muted);
	}

	@media (max-width: 980px) {
		.workspace {
			grid-template-columns: 1fr;
		}

		.board {
			min-height: 36rem;
		}
	}
</style>

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
		pixelSnap: boolean;
		settleMs: number;
		width: number;
		height: number;
	};

	const cards: MotionCard[] = [
		{
			id: 'raw',
			label: 'Raw follow',
			note: 'No snap and no settle. This is the clean latency read.',
			theme: 'burnt',
			pixelSnap: false,
			settleMs: 0,
			width: 176,
			height: 176
		},
		{
			id: 'snap',
			label: 'Pixel snap',
			note: 'Snaps to integer movement so you can feel quantization immediately.',
			theme: 'slate',
			pixelSnap: true,
			settleMs: 0,
			width: 168,
			height: 168
		},
		{
			id: 'settle',
			label: 'Soft settle',
			note: 'Direct while dragging, but eases into place after release.',
			theme: 'cream',
			pixelSnap: false,
			settleMs: 160,
			width: 182,
			height: 182
		},
		{
			id: 'micro',
			label: 'Micro precision',
			note: 'Smaller box with snap and short settle for precision checking.',
			theme: 'ink',
			pixelSnap: true,
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
	<title>svelte-dnd smoothness lab</title>
</svelte:head>

<section class="shell">
	<header class="hero">
		<div>
			<p class="eyebrow">Smoothness Lab</p>
			<h1>Drag the boxes on one shared board.</h1>
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
						style={`--settle-ms:${card.settleMs}ms; width:${card.width}px; height:${card.height}px;`}
						{@attach draggable({ controller, id: card.id, onCommit: recordCommit })}
					>
						<div class="card-top">
							<p>{card.label}</p>
							<span>{card.pixelSnap ? 'snap' : 'free'}</span>
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
								{@attach resizeHandle({
									controller,
									id: card.id,
									handle: 'se',
									lockAspectRatio,
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
				<p class="eyebrow">Variants</p>
				<ul>
					{#each cards as card}
						<li>
							<strong>{card.label}</strong>
							<span>{card.pixelSnap ? 'snapped movement' : 'free movement'}</span>
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
	:global(body) {
		margin: 0;
		font-family: 'Iowan Old Style', 'Palatino Linotype', serif;
		background:
			radial-gradient(circle at 20% 0%, rgba(251, 187, 111, 0.16), transparent 34%),
			radial-gradient(circle at 100% 20%, rgba(108, 138, 156, 0.18), transparent 28%),
			linear-gradient(180deg, #f7f1e8 0%, #ebe1d3 100%);
		color: #201a16;
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
		border: 1px solid rgba(53, 41, 33, 0.12);
		background: rgba(255, 250, 244, 0.74);
		backdrop-filter: blur(16px);
		box-shadow: 0 24px 60px rgba(71, 55, 43, 0.12);
	}

	.hero {
		padding: 1.45rem 1.6rem;
		border-radius: 1.7rem;
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}

	.eyebrow {
		margin: 0 0 0.45rem;
		font-size: 0.74rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #9f5d2b;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.3rem, 6vw, 4.6rem);
		line-height: 0.94;
		max-width: 12ch;
	}

	.lede {
		margin: 0.9rem 0 0;
		max-width: 50rem;
		font-size: 1rem;
		line-height: 1.5;
		color: #615248;
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
		padding: 0.85rem 1rem;
		border-radius: 999px;
		border: 1px solid rgba(53, 41, 33, 0.14);
		background: rgba(255, 255, 255, 0.78);
	}

	.switch input {
		width: 1rem;
		height: 1rem;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 21rem;
		gap: 1rem;
	}

	.board-wrap {
		padding: 1rem;
		border-radius: 1.55rem;
	}

	.board {
		position: relative;
		min-height: 44rem;
		overflow: hidden;
		border-radius: 1.2rem;
		background:
			linear-gradient(rgba(127, 101, 77, 0.11) 1px, transparent 1px),
			linear-gradient(90deg, rgba(127, 101, 77, 0.11) 1px, transparent 1px),
			linear-gradient(180deg, #faf4ea 0%, #f2e5d3 100%);
		background-size:
			24px 24px,
			24px 24px,
			auto;
	}

	:global(.board[data-dnd-over='true']),
	:global(.panel[data-dnd-over='true']) {
		box-shadow: inset 0 0 0 2px rgba(173, 95, 43, 0.38);
	}

	.board-tag {
		position: absolute;
		top: 0.9rem;
		left: 0.9rem;
		padding: 0.3rem 0.55rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.82);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #745f51;
	}

	.card {
		position: absolute;
		top: 0;
		left: 0;
		padding: 1rem;
		border-radius: 1.2rem;
		border: 1px solid rgba(36, 29, 24, 0.12);
		box-shadow: 0 18px 28px rgba(53, 39, 30, 0.16);
		user-select: none;
	}

	.card.settle:not(.active) {
		transition:
			transform var(--settle-ms) cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 140ms ease;
	}

	.card.active {
		box-shadow:
			0 24px 36px rgba(53, 39, 30, 0.2),
			0 0 0 2px rgba(173, 95, 43, 0.24);
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
		font-size: 1rem;
		font-weight: 700;
	}

	.card-top span,
	.card-meta span {
		font-size: 0.76rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		opacity: 0.82;
	}

	.card-note {
		margin-top: 0.7rem;
		font-size: 0.92rem;
		line-height: 1.42;
		max-width: 22ch;
	}

	.card-meta {
		margin-top: 1rem;
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
		border: 0;
		border-radius: 999px;
		background: #fff8ef;
		box-shadow: 0 0 0 1px rgba(53, 41, 33, 0.18);
		pointer-events: auto;
	}

	.burnt {
		background:
			linear-gradient(135deg, rgba(255, 252, 247, 0.92), rgba(255, 252, 247, 0.28)),
			linear-gradient(145deg, #af6433, #f0c28b);
	}

	.slate {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.22)),
			linear-gradient(160deg, #3f5560, #8da5b1);
		color: #fbf7f3;
	}

	.cream {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 252, 247, 0.64)),
			linear-gradient(145deg, #f3ddb7, #fff2dc);
	}

	.ink {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.2)),
			linear-gradient(145deg, #2a292f, #7b7791);
		color: #fbf8ff;
	}

	.sidebar {
		display: grid;
		gap: 1rem;
		align-content: start;
	}

	.panel {
		padding: 1.1rem;
		border-radius: 1.3rem;
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
		border-top: 1px solid rgba(53, 41, 33, 0.08);
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
		color: #7a6657;
	}

	.panel span,
	.panel li,
	.empty {
		font-size: 0.92rem;
		line-height: 1.4;
	}

	.empty {
		margin: 0;
		color: #65564d;
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

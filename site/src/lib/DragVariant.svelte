<script lang="ts">
	import {
		createEditorController,
		draggable,
		droppable,
		resizeHandle,
		type CommittedInteraction,
		type EditorControllerSnapshot,
		type TransformInput
	} from 'svelte-dnd';

	type VariantTheme = 'burnt' | 'slate' | 'cream' | 'ink';

	type VariantProps = {
		id: string;
		title: string;
		note: string;
		mode: string;
		theme: VariantTheme;
		pixelSnap: boolean;
		lockAspectRatio: boolean;
		settleMs: number;
		initial: TransformInput;
		size?: {
			width: number;
			height: number;
		};
	};

	let {
		id,
		title,
		note,
		mode,
		theme,
		pixelSnap,
		lockAspectRatio,
		settleMs,
		initial,
		size = { width: 156, height: 156 }
	}: VariantProps = $props();

	let controller = $state<ReturnType<typeof createEditorController> | null>(null);
	let snapshot = $state<EditorControllerSnapshot | null>(null);
	let commitLog = $state<string[]>([]);
	let motionSamples = $state(0);
	let dragRuns = $state(0);
	let maxTravel = $state(0);
	let boxId = $derived(`${id}-box`);
	let stageId = $derived(`${id}-stage`);
	let dockId = $derived(`${id}-dock`);
	let transform = $derived(snapshot?.previewTransforms.get(boxId));

	$effect(() => {
		const nextController = createEditorController({
			pixelSnap,
			initialTransforms: {
				[boxId]: initial
			}
		});

		controller = nextController;
		snapshot = nextController.getSnapshot() as EditorControllerSnapshot;

		const unsubscribe = nextController.subscribe((next: EditorControllerSnapshot) => {
			snapshot = next;
		});

		return () => {
			unsubscribe();
			nextController.destroy();
			controller = null;
			snapshot = null;
		};
	});

	$effect(() => {
		if (!snapshot) {
			return;
		}

		const active = snapshot.active;

		if (!active || active.nodeId !== boxId) {
			return;
		}

		motionSamples += 1;

		const current = active.transformCurrent;
		const travel = Math.hypot(current.x, current.y);
		maxTravel = Math.max(maxTravel, travel);
	});

	function recordCommit(commit: CommittedInteraction): void {
		dragRuns += 1;
		commitLog = [
			`${commit.nodeId} -> ${commit.overId ?? 'none'} at ${Math.round(commit.transform.x)}, ${Math.round(commit.transform.y)}`,
			...commitLog
		].slice(0, 4);
	}

	function reset(): void {
		if (!controller) {
			return;
		}

		controller.setTransform(boxId, initial);
		commitLog = [];
		motionSamples = 0;
		dragRuns = 0;
		maxTravel = 0;
	}
</script>

<section class={`variant ${theme}`}>
	<div class="variant-head">
		<div>
			<p class="mode">{mode}</p>
			<h2>{title}</h2>
			<p class="note">{note}</p>
		</div>

		<button type="button" onclick={reset}>Reset</button>
	</div>

	<div class="testbed">
		{#if controller}
			<div class="arena" {@attach droppable({ controller, id: stageId })}>
				<div class="tag">drag zone</div>

				<div
					class={`box ${theme} ${settleMs > 0 ? 'settle' : ''}`}
					class:active={snapshot?.active?.nodeId === boxId}
					style={`--settle-ms:${settleMs}ms; width:${size.width}px; height:${size.height}px;`}
					{@attach draggable({ controller, id: boxId, onCommit: recordCommit })}
				>
					<div class="box-core">
						<p>Drag me</p>
						<span>{pixelSnap ? 'snap on' : 'snap off'}</span>
					</div>

					<div class="handles">
						<button
							type="button"
							class="handle se"
							aria-label="Resize box from bottom right"
							{@attach resizeHandle({
								controller,
								id: boxId,
								handle: 'se',
								lockAspectRatio,
								onCommit: recordCommit
							})}
						></button>
					</div>
				</div>
			</div>
			<div class="dock" {@attach droppable({ controller, id: dockId })}>
				<p>Drop target</p>
				<span>Test hover handoff</span>
			</div>
		{/if}
	</div>

	<div class="metrics">
		<div>
			<strong>active</strong>
			<span>{snapshot?.active?.nodeId === boxId ? 'dragging' : 'idle'}</span>
		</div>
		<div>
			<strong>hover</strong>
			<span>{snapshot?.hoveredDroppableId ?? 'none'}</span>
		</div>
		<div>
			<strong>position</strong>
			<span
				>{Math.round((transform?.x ?? 0) * 10) / 10}, {Math.round((transform?.y ?? 0) * 10) /
					10}</span
			>
		</div>
		<div>
			<strong>samples</strong>
			<span>{motionSamples}</span>
		</div>
		<div>
			<strong>runs</strong>
			<span>{dragRuns}</span>
		</div>
		<div>
			<strong>max travel</strong>
			<span>{Math.round(maxTravel)} px</span>
		</div>
		<div>
			<strong>ratio</strong>
			<span>{lockAspectRatio ? 'locked' : 'free'}</span>
		</div>
	</div>

	<div class="commit-log">
		<strong>Recent drops</strong>
		{#if commitLog.length === 0}
			<p>Move the box around and drop it on either side.</p>
		{:else}
			<ul>
				{#each commitLog as entry}
					<li>{entry}</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.variant {
		display: grid;
		gap: 1rem;
		padding: 1.1rem;
		border: 1px solid rgba(53, 41, 33, 0.12);
		border-radius: 1.4rem;
		background: rgba(255, 251, 247, 0.78);
		box-shadow: 0 20px 50px rgba(59, 44, 34, 0.08);
	}

	.variant-head {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	.mode {
		margin: 0 0 0.35rem;
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #9f5d2b;
	}

	h2 {
		margin: 0;
		font-size: 1.35rem;
	}

	.note {
		margin: 0.45rem 0 0;
		font-size: 0.94rem;
		line-height: 1.45;
		color: #65564d;
		max-width: 34ch;
	}

	button {
		padding: 0.7rem 0.95rem;
		border-radius: 999px;
		border: 1px solid rgba(53, 41, 33, 0.14);
		background: rgba(255, 255, 255, 0.72);
		cursor: pointer;
	}

	.testbed {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 9.5rem;
		gap: 0.85rem;
		align-items: stretch;
	}

	.arena,
	.dock {
		position: relative;
		min-height: 17rem;
		border-radius: 1rem;
		border: 1px solid rgba(53, 41, 33, 0.1);
		overflow: hidden;
	}

	.arena {
		background:
			linear-gradient(rgba(127, 101, 77, 0.11) 1px, transparent 1px),
			linear-gradient(90deg, rgba(127, 101, 77, 0.11) 1px, transparent 1px),
			linear-gradient(180deg, #faf4ea 0%, #f2e5d3 100%);
		background-size:
			24px 24px,
			24px 24px,
			auto;
	}

	.dock {
		display: grid;
		place-content: center;
		text-align: center;
		background: linear-gradient(180deg, #fdf8f3 0%, #f1e7dc 100%);
	}

	:global(.arena[data-dnd-over='true']),
	:global(.dock[data-dnd-over='true']) {
		box-shadow: inset 0 0 0 2px rgba(173, 95, 43, 0.38);
	}

	.tag {
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

	.box {
		position: absolute;
		top: 0;
		left: 0;
		padding: 1rem;
		border-radius: 1.2rem;
		border: 1px solid rgba(36, 29, 24, 0.12);
		box-shadow: 0 18px 28px rgba(53, 39, 30, 0.16);
		user-select: none;
	}

	.box.settle:not(.active) {
		transition:
			transform var(--settle-ms) cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 140ms ease;
	}

	.box.active {
		box-shadow:
			0 24px 36px rgba(53, 39, 30, 0.2),
			0 0 0 2px rgba(173, 95, 43, 0.24);
	}

	.box-core {
		display: grid;
		gap: 0.35rem;
		align-content: end;
		height: 100%;
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

	.box-core p,
	.box-core span {
		margin: 0;
	}

	.box-core p {
		font-size: 1rem;
		font-weight: 700;
	}

	.box-core span {
		font-size: 0.78rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		opacity: 0.82;
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

	.metrics {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.metrics div,
	.commit-log {
		padding-top: 0.75rem;
		border-top: 1px solid rgba(53, 41, 33, 0.08);
	}

	.metrics strong,
	.commit-log strong {
		display: block;
		font-size: 0.76rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #7a6657;
		margin-bottom: 0.2rem;
	}

	.metrics span,
	.commit-log p,
	.commit-log li,
	.dock p,
	.dock span {
		font-size: 0.92rem;
	}

	.commit-log p {
		margin: 0.4rem 0 0;
		color: #65564d;
	}

	.commit-log ul {
		margin: 0.55rem 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.45rem;
	}

	.commit-log li {
		color: #46392f;
	}

	.dock p,
	.dock span {
		margin: 0;
	}

	.dock p {
		font-weight: 700;
	}

	.dock span {
		color: #706055;
	}

	@media (max-width: 720px) {
		.testbed {
			grid-template-columns: 1fr;
		}

		.metrics {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>

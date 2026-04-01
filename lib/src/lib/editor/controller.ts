import {
	type CommittedInteraction,
	type EditorController,
	type EditorControllerOptions,
	type EditorControllerSnapshot,
	type NodeId,
	type TransformInput,
	type TransformSnapshot
} from '../core/types.js';
import { createEditorEngine } from '../core/editor-engine.js';
import { identityTransform } from '../core/types.js';

function normalizeTransform(input?: TransformInput): TransformSnapshot {
	return {
		...identityTransform(),
		...input
	};
}

function cloneTransforms(
	source: ReadonlyMap<NodeId, TransformSnapshot>
): ReadonlyMap<NodeId, TransformSnapshot> {
	return new Map(source);
}

export function createEditorController(options: EditorControllerOptions = {}): EditorController {
	const engine = createEditorEngine(options);
	const listeners = new Set<(snapshot: EditorControllerSnapshot) => void>();
	const transforms = new Map<NodeId, TransformSnapshot>();
	let engineSnapshot = engine.getSnapshot();

	function seedTransforms(): void {
		if (!options.initialTransforms) {
			return;
		}

		const entries =
			Symbol.iterator in Object(options.initialTransforms)
				? Array.from(options.initialTransforms as Iterable<readonly [NodeId, TransformInput]>)
				: (Object.entries(options.initialTransforms) as [NodeId, TransformInput][]);

		for (const [id, transform] of entries) {
			transforms.set(id, normalizeTransform(transform));
		}
	}

	function buildSnapshot(): EditorControllerSnapshot {
		const previewTransforms = new Map(transforms);

		if (engineSnapshot.active) {
			previewTransforms.set(
				engineSnapshot.active.nodeId,
				normalizeTransform(engineSnapshot.active.transformCurrent)
			);
		}

		return {
			active: engineSnapshot.active,
			hoveredDroppableId: engineSnapshot.hoveredDroppableId,
			transforms: cloneTransforms(transforms),
			previewTransforms
		};
	}

	let currentSnapshot = buildSnapshot();

	function publish(): void {
		currentSnapshot = buildSnapshot();

		for (const listener of listeners) {
			listener(currentSnapshot);
		}
	}

	seedTransforms();
	currentSnapshot = buildSnapshot();

	const unsubscribeEngine = engine.subscribe((snapshot) => {
		engineSnapshot = snapshot;
		publish();
	});

	return {
		engine,
		registerTransform(id, transform) {
			if (!transforms.has(id)) {
				transforms.set(id, normalizeTransform(transform));
				publish();
			}
		},
		setTransform(id, transform) {
			transforms.set(id, normalizeTransform(transform));
			publish();
		},
		getTransform(id) {
			return normalizeTransform(transforms.get(id));
		},
		getLiveTransform(id) {
			if (engineSnapshot.active?.nodeId === id) {
				return normalizeTransform(engineSnapshot.active.transformCurrent);
			}

			return normalizeTransform(transforms.get(id));
		},
		getSnapshot() {
			return currentSnapshot;
		},
		commitActive(): CommittedInteraction | null {
			const active = engine.getSnapshot().active;

			if (active) {
				transforms.set(active.nodeId, normalizeTransform(active.transformCurrent));
			}

			const committed = engine.commitInteraction();
			publish();
			return committed;
		},
		cancelActive() {
			engine.cancelInteraction();
			publish();
		},
		subscribe(listener) {
			listeners.add(listener);
			listener(currentSnapshot);

			return () => {
				listeners.delete(listener);
			};
		},
		destroy() {
			unsubscribeEngine();
			listeners.clear();
		}
	};
}

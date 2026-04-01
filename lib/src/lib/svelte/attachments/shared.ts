import type { EditorController, NodeId, Point, TransformSnapshot } from '../../core/types.js';

const ACTIVE_DATASET_KEY = 'dndActive';

export function eventPoint(event: PointerEvent): Point {
	return {
		x: event.clientX,
		y: event.clientY
	};
}

export function transformToCss(transform: TransformSnapshot): string {
	return `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotation}deg) scale(${transform.scaleX}, ${transform.scaleY})`;
}

export function bindPreviewTransform(
	element: HTMLElement,
	controller: EditorController,
	id: NodeId
): () => void {
	const initialTransform = element.style.transform;
	const initialTransformOrigin = element.style.transformOrigin;
	const initialTouchAction = element.style.touchAction;
	const initialWillChange = element.style.willChange;

	element.style.transformOrigin = 'top left';
	element.style.touchAction = 'none';

	const unsubscribe = controller.subscribe((snapshot) => {
		const transform = snapshot.previewTransforms.get(id) ?? controller.getTransform(id);

		element.style.transform = transformToCss(transform);
		element.dataset[ACTIVE_DATASET_KEY] = snapshot.active?.nodeId === id ? 'true' : 'false';
		element.style.willChange = snapshot.active?.nodeId === id ? 'transform' : initialWillChange;
	});

	return () => {
		unsubscribe();
		element.style.transform = initialTransform;
		element.style.transformOrigin = initialTransformOrigin;
		element.style.touchAction = initialTouchAction;
		element.style.willChange = initialWillChange;
		delete element.dataset[ACTIVE_DATASET_KEY];
	};
}

export function finishPointerInteraction(
	element: HTMLElement,
	pointerId: number,
	onFinish: () => void
): void {
	if (element.hasPointerCapture(pointerId)) {
		element.releasePointerCapture(pointerId);
	}

	onFinish();
}

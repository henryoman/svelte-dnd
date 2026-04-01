import type { Attachment } from 'svelte/attachments';

import type {
	CommittedInteraction,
	EditorController,
	NodeId,
	TransformInput
} from '../../core/types.js';
import { bindPreviewTransform, eventPoint, finishPointerInteraction } from './shared.js';

export interface DraggableAttachmentOptions {
	controller: EditorController;
	id: NodeId;
	data?: Record<string, unknown>;
	initialTransform?: TransformInput;
	disabled?: boolean;
	lockAspectRatio?: boolean;
	onCommit?: (commit: CommittedInteraction) => void;
}

export function draggable(options: DraggableAttachmentOptions): Attachment<HTMLElement> {
	return (element) => {
		options.controller.registerTransform(options.id, options.initialTransform);

		const unregister = options.controller.engine.registerDraggable({
			id: options.id,
			element,
			data: options.data
		});

		const unbindPreview = bindPreviewTransform(element, options.controller, options.id);
		const initialCursor = element.style.cursor;
		element.style.cursor = 'grab';
		element.dataset.svelteDndLockAspectRatio = options.lockAspectRatio ? 'true' : 'false';

		function onPointerDown(event: PointerEvent): void {
			if (options.disabled || event.button !== 0) {
				return;
			}

			const target = event.target;

			if (target instanceof HTMLElement && target.closest('[data-svelte-dnd-resize-handle]')) {
				return;
			}

			element.setPointerCapture(event.pointerId);
			element.style.cursor = 'grabbing';
			options.controller.engine.beginInteraction({
				kind: 'drag',
				nodeId: options.id,
				pointer: eventPoint(event),
				transform: options.controller.getTransform(options.id)
			});
			event.preventDefault();
		}

		function onPointerMove(event: PointerEvent): void {
			if (!element.hasPointerCapture(event.pointerId)) {
				return;
			}

			options.controller.engine.updatePointer(eventPoint(event));
		}

		function onPointerUp(event: PointerEvent): void {
			if (!element.hasPointerCapture(event.pointerId)) {
				return;
			}

			finishPointerInteraction(element, event.pointerId, () => {
				const commit = options.controller.commitActive();
				if (commit) {
					options.onCommit?.(commit);
				}
				element.style.cursor = 'grab';
			});
		}

		function onPointerCancel(event: PointerEvent): void {
			if (!element.hasPointerCapture(event.pointerId)) {
				return;
			}

			finishPointerInteraction(element, event.pointerId, () => {
				options.controller.cancelActive();
				element.style.cursor = 'grab';
			});
		}

		element.addEventListener('pointerdown', onPointerDown);
		element.addEventListener('pointermove', onPointerMove);
		element.addEventListener('pointerup', onPointerUp);
		element.addEventListener('pointercancel', onPointerCancel);

		return () => {
			unregister();
			unbindPreview();
			element.style.cursor = initialCursor;
			delete element.dataset.svelteDndLockAspectRatio;
			element.removeEventListener('pointerdown', onPointerDown);
			element.removeEventListener('pointermove', onPointerMove);
			element.removeEventListener('pointerup', onPointerUp);
			element.removeEventListener('pointercancel', onPointerCancel);
		};
	};
}

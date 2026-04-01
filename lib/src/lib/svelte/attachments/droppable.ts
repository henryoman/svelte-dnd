import type { Attachment } from 'svelte/attachments';

import type { EditorController, NodeId } from '../../core/types.js';

export interface DroppableAttachmentOptions {
	controller: EditorController;
	id: NodeId;
	data?: Record<string, unknown>;
}

export function droppable(options: DroppableAttachmentOptions): Attachment<HTMLElement> {
	return (element) => {
		const unregister = options.controller.engine.registerDroppable({
			id: options.id,
			element,
			data: options.data
		});

		const unsubscribe = options.controller.subscribe((snapshot) => {
			element.dataset.dndOver = snapshot.hoveredDroppableId === options.id ? 'true' : 'false';
		});

		return () => {
			unregister();
			unsubscribe();
			delete element.dataset.dndOver;
		};
	};
}

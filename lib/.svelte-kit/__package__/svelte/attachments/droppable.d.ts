import type { Attachment } from 'svelte/attachments';
import type { EditorController, NodeId } from '../../core/types.js';
export interface DroppableAttachmentOptions {
    controller: EditorController;
    id: NodeId;
    data?: Record<string, unknown>;
}
export declare function droppable(options: DroppableAttachmentOptions): Attachment<HTMLElement>;

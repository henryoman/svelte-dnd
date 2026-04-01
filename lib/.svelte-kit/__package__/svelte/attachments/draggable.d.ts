import type { Attachment } from 'svelte/attachments';
import type { CommittedInteraction, EditorController, NodeId, TransformInput } from '../../core/types.js';
export interface DraggableAttachmentOptions {
    controller: EditorController;
    id: NodeId;
    data?: Record<string, unknown>;
    initialTransform?: TransformInput;
    disabled?: boolean;
    onCommit?: (commit: CommittedInteraction) => void;
}
export declare function draggable(options: DraggableAttachmentOptions): Attachment<HTMLElement>;

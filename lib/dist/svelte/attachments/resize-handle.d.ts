import type { Attachment } from 'svelte/attachments';
import type { CommittedInteraction, EditorController, NodeId, ResizeHandle } from '../../core/types.js';
export interface ResizeHandleAttachmentOptions {
    controller: EditorController;
    id: NodeId;
    handle: ResizeHandle;
    disabled?: boolean;
    lockAspectRatio?: boolean;
    onCommit?: (commit: CommittedInteraction) => void;
}
export declare function resizeHandle(options: ResizeHandleAttachmentOptions): Attachment<HTMLElement>;

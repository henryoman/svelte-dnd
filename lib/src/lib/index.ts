export { createEditorEngine, createDefaultTransform } from './core/editor-engine.js';
export type {
	BeginInteractionInput,
	CommittedInteraction,
	DraggableRegistration,
	DroppableRegistration,
	EditorController,
	EditorControllerOptions,
	EditorControllerSnapshot,
	EditorEngine,
	EditorEngineOptions,
	EditorEngineSnapshot,
	InteractionKind,
	InteractionState,
	NodeId,
	Point,
	Rect,
	ResizeHandle,
	Size,
	TransformInput,
	TransformSnapshot
} from './core/types.js';

export { identityTransform } from './core/types.js';
export { createEditorController } from './editor/controller.js';
export { updateTransformSession } from './editor/transform-session.js';
export {
	IDENTITY_MATRIX,
	matrixToCss,
	multiplyMatrix,
	translateMatrix
} from './geometry/matrix.js';
export { pointInRect, rectFromDomRect, translateRect } from './geometry/rect.js';
export { createEditorPreset } from './presets/editor.js';
export { draggable } from './svelte/attachments/draggable.js';
export { droppable } from './svelte/attachments/droppable.js';
export { resizeHandle } from './svelte/attachments/resize-handle.js';
export { transformToCss } from './svelte/attachments/shared.js';

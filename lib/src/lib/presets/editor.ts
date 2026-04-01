import type { EditorControllerOptions } from '../core/types.js';
import { createEditorController } from '../editor/controller.js';

export type EditorPresetOptions = EditorControllerOptions;

export function createEditorPreset(options: EditorPresetOptions = {}) {
	return createEditorController(options);
}

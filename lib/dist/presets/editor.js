import { createEditorController } from '../editor/controller.js';
export function createEditorPreset(options = {}) {
    return createEditorController(options);
}

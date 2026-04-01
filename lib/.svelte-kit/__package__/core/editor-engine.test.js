import { describe, expect, test } from 'bun:test';
import { createEditorEngine } from './editor-engine.js';
import { identityTransform } from './types.js';
import { createMockElement, flushAnimationFrame, installAnimationFrameMock } from '../test-utils.js';
installAnimationFrameMock();
describe('createEditorEngine', () => {
    test('tracks hovered droppable ids during interaction and returns them on commit', async () => {
        const engine = createEditorEngine({ pixelSnap: true });
        engine.registerDraggable({
            id: 'card',
            element: createMockElement({ x: 0, y: 0, width: 80, height: 80 })
        });
        engine.registerDroppable({
            id: 'stage',
            element: createMockElement({ x: 0, y: 0, width: 200, height: 200 })
        });
        engine.registerDroppable({
            id: 'inspector',
            element: createMockElement({ x: 240, y: 0, width: 120, height: 200 })
        });
        engine.beginInteraction({
            kind: 'drag',
            nodeId: 'card',
            pointer: { x: 20, y: 20 },
            transform: identityTransform()
        });
        expect(engine.getSnapshot().hoveredDroppableId).toBe('stage');
        engine.updatePointer({ x: 270, y: 30 });
        await flushAnimationFrame();
        expect(engine.getSnapshot().hoveredDroppableId).toBe('inspector');
        expect(engine.getPreviewTransform()).toEqual({
            ...identityTransform(),
            x: 250,
            y: 10
        });
        expect(engine.commitInteraction()).toEqual({
            kind: 'drag',
            nodeId: 'card',
            transform: {
                ...identityTransform(),
                x: 250,
                y: 10
            },
            overId: 'inspector'
        });
    });
});

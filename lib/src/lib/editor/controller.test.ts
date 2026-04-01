import { describe, expect, test } from 'bun:test';

import { createEditorController } from './controller.js';
import {
	createMockElement,
	flushAnimationFrame,
	installAnimationFrameMock
} from '../test-utils.js';

installAnimationFrameMock();

describe('createEditorController', () => {
	test('keeps preview state separate from committed state until commit', async () => {
		const controller = createEditorController({
			initialTransforms: {
				card: { x: 10, y: 15 }
			}
		});

		controller.engine.registerDraggable({
			id: 'card',
			element: createMockElement({ x: 0, y: 0, width: 80, height: 80 })
		});

		controller.engine.registerDroppable({
			id: 'stage',
			element: createMockElement({ x: 0, y: 0, width: 400, height: 300 })
		});

		controller.engine.beginInteraction({
			kind: 'drag',
			nodeId: 'card',
			pointer: { x: 0, y: 0 },
			transform: controller.getTransform('card')
		});

		controller.engine.updatePointer({ x: 32, y: 24 });
		await flushAnimationFrame();

		const duringDrag = controller.getSnapshot();
		expect(duringDrag.transforms.get('card')).toMatchObject({ x: 10, y: 15 });
		expect(duringDrag.previewTransforms.get('card')).toMatchObject({ x: 42, y: 39 });

		expect(controller.commitActive()).toMatchObject({
			nodeId: 'card',
			overId: 'stage'
		});

		const afterCommit = controller.getSnapshot();
		expect(afterCommit.transforms.get('card')).toMatchObject({ x: 42, y: 39 });
		expect(afterCommit.previewTransforms.get('card')).toMatchObject({ x: 42, y: 39 });
	});
});

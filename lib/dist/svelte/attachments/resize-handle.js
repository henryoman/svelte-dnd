import { eventPoint, finishPointerInteraction } from './shared.js';
const cursors = {
    n: 'ns-resize',
    ne: 'nesw-resize',
    e: 'ew-resize',
    se: 'nwse-resize',
    s: 'ns-resize',
    sw: 'nesw-resize',
    w: 'ew-resize',
    nw: 'nwse-resize'
};
export function resizeHandle(options) {
    return (element) => {
        const initialCursor = element.style.cursor;
        const initialTouchAction = element.style.touchAction;
        element.dataset.svelteDndResizeHandle = options.handle;
        element.style.cursor = cursors[options.handle];
        element.style.touchAction = 'none';
        function onPointerDown(event) {
            if (options.disabled || event.button !== 0) {
                return;
            }
            element.setPointerCapture(event.pointerId);
            options.controller.engine.beginInteraction({
                kind: 'resize',
                nodeId: options.id,
                handle: options.handle,
                lockAspectRatio: options.lockAspectRatio ?? false,
                pointer: eventPoint(event),
                transform: options.controller.getTransform(options.id)
            });
            event.preventDefault();
            event.stopPropagation();
        }
        function onPointerMove(event) {
            if (!element.hasPointerCapture(event.pointerId)) {
                return;
            }
            options.controller.engine.updatePointer(eventPoint(event));
        }
        function onPointerUp(event) {
            if (!element.hasPointerCapture(event.pointerId)) {
                return;
            }
            finishPointerInteraction(element, event.pointerId, () => {
                const commit = options.controller.commitActive();
                if (commit) {
                    options.onCommit?.(commit);
                }
            });
        }
        function onPointerCancel(event) {
            if (!element.hasPointerCapture(event.pointerId)) {
                return;
            }
            finishPointerInteraction(element, event.pointerId, () => {
                options.controller.cancelActive();
            });
        }
        element.addEventListener('pointerdown', onPointerDown);
        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerup', onPointerUp);
        element.addEventListener('pointercancel', onPointerCancel);
        return () => {
            element.style.cursor = initialCursor;
            element.style.touchAction = initialTouchAction;
            delete element.dataset.svelteDndResizeHandle;
            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', onPointerUp);
            element.removeEventListener('pointercancel', onPointerCancel);
        };
    };
}

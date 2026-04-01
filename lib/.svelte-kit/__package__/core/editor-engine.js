import {} from './types.js';
import { identityTransform } from './types.js';
import { FrameLoop } from './frame-loop.js';
import { MeasurementCache } from './measurement-cache.js';
import { updateTransformSession } from '../editor/transform-session.js';
import { pointInRect } from '../geometry/rect.js';
export function createEditorEngine(options = {}) {
    const draggables = new Map();
    const droppables = new Map();
    const measurements = new MeasurementCache();
    const listeners = new Set();
    let active = null;
    let pendingPointer = null;
    let hoveredDroppableId = null;
    function snapshot() {
        return {
            active,
            draggableCount: draggables.size,
            droppableCount: droppables.size,
            hoveredDroppableId
        };
    }
    function publish() {
        const next = snapshot();
        for (const listener of listeners) {
            listener(next);
        }
    }
    function updateHoveredDroppable(pointer) {
        hoveredDroppableId = null;
        for (const [id, registration] of droppables) {
            const rect = measurements.get(id) ?? measurements.measure(id, registration.element);
            if (pointInRect(pointer, rect)) {
                hoveredDroppableId = id;
            }
        }
    }
    const frameLoop = new FrameLoop(() => {
        if (!active || !pendingPointer) {
            return;
        }
        active = {
            ...active,
            pointerCurrent: pendingPointer,
            transformCurrent: updateTransformSession({
                kind: active.kind,
                pointerStart: active.pointerStart,
                transformStart: active.transformStart,
                handle: active.handle,
                pixelSnap: options.pixelSnap ?? false,
                lockAspectRatio: active.lockAspectRatio ?? false
            }, pendingPointer)
        };
        updateHoveredDroppable(pendingPointer);
        pendingPointer = null;
        publish();
    });
    function registerDraggable(registration) {
        draggables.set(registration.id, registration);
        publish();
        return () => {
            draggables.delete(registration.id);
            measurements.invalidate(registration.id);
            publish();
        };
    }
    function registerDroppable(registration) {
        droppables.set(registration.id, registration);
        publish();
        return () => {
            droppables.delete(registration.id);
            measurements.invalidate(registration.id);
            publish();
        };
    }
    function snapshotMeasurements() {
        for (const [id, registration] of draggables) {
            measurements.measure(id, registration.element);
        }
        for (const [id, registration] of droppables) {
            measurements.measure(id, registration.element);
        }
    }
    return {
        registerDraggable,
        registerDroppable,
        snapshotMeasurements,
        beginInteraction(input) {
            measurements.invalidate();
            snapshotMeasurements();
            active = {
                kind: input.kind,
                nodeId: input.nodeId,
                pointerStart: input.pointer,
                pointerCurrent: input.pointer,
                transformStart: input.transform,
                transformCurrent: input.transform,
                handle: input.handle,
                lockAspectRatio: input.lockAspectRatio
            };
            pendingPointer = input.pointer;
            updateHoveredDroppable(input.pointer);
            publish();
        },
        updatePointer(pointer) {
            if (!active) {
                return;
            }
            pendingPointer = pointer;
            frameLoop.request();
        },
        getSnapshot() {
            return snapshot();
        },
        getPreviewTransform() {
            return active?.transformCurrent ?? null;
        },
        commitInteraction() {
            if (!active) {
                return null;
            }
            const committed = {
                kind: active.kind,
                nodeId: active.nodeId,
                transform: active.transformCurrent,
                overId: hoveredDroppableId
            };
            active = null;
            pendingPointer = null;
            hoveredDroppableId = null;
            publish();
            return committed;
        },
        cancelInteraction() {
            active = null;
            pendingPointer = null;
            hoveredDroppableId = null;
            frameLoop.cancel();
            publish();
        },
        subscribe(listener) {
            listeners.add(listener);
            listener(snapshot());
            return () => {
                listeners.delete(listener);
            };
        }
    };
}
export function createDefaultTransform() {
    return identityTransform();
}

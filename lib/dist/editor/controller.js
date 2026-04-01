import {} from '../core/types.js';
import { createEditorEngine } from '../core/editor-engine.js';
import { identityTransform } from '../core/types.js';
function normalizeTransform(input) {
    return {
        ...identityTransform(),
        ...input
    };
}
function cloneTransforms(source) {
    return new Map(source);
}
export function createEditorController(options = {}) {
    const engine = createEditorEngine(options);
    const listeners = new Set();
    const transforms = new Map();
    let engineSnapshot = engine.getSnapshot();
    function seedTransforms() {
        if (!options.initialTransforms) {
            return;
        }
        const entries = Symbol.iterator in Object(options.initialTransforms)
            ? Array.from(options.initialTransforms)
            : Object.entries(options.initialTransforms);
        for (const [id, transform] of entries) {
            transforms.set(id, normalizeTransform(transform));
        }
    }
    function buildSnapshot() {
        const previewTransforms = new Map(transforms);
        if (engineSnapshot.active) {
            previewTransforms.set(engineSnapshot.active.nodeId, normalizeTransform(engineSnapshot.active.transformCurrent));
        }
        return {
            active: engineSnapshot.active,
            hoveredDroppableId: engineSnapshot.hoveredDroppableId,
            transforms: cloneTransforms(transforms),
            previewTransforms
        };
    }
    let currentSnapshot = buildSnapshot();
    function publish() {
        currentSnapshot = buildSnapshot();
        for (const listener of listeners) {
            listener(currentSnapshot);
        }
    }
    seedTransforms();
    currentSnapshot = buildSnapshot();
    const unsubscribeEngine = engine.subscribe((snapshot) => {
        engineSnapshot = snapshot;
        publish();
    });
    return {
        engine,
        registerTransform(id, transform) {
            if (!transforms.has(id)) {
                transforms.set(id, normalizeTransform(transform));
                publish();
            }
        },
        setTransform(id, transform) {
            transforms.set(id, normalizeTransform(transform));
            publish();
        },
        getTransform(id) {
            return normalizeTransform(transforms.get(id));
        },
        getLiveTransform(id) {
            if (engineSnapshot.active?.nodeId === id) {
                return normalizeTransform(engineSnapshot.active.transformCurrent);
            }
            return normalizeTransform(transforms.get(id));
        },
        getSnapshot() {
            return currentSnapshot;
        },
        commitActive() {
            const active = engine.getSnapshot().active;
            if (active) {
                transforms.set(active.nodeId, normalizeTransform(active.transformCurrent));
            }
            const committed = engine.commitInteraction();
            publish();
            return committed;
        },
        cancelActive() {
            engine.cancelInteraction();
            publish();
        },
        subscribe(listener) {
            listeners.add(listener);
            listener(currentSnapshot);
            return () => {
                listeners.delete(listener);
            };
        },
        destroy() {
            unsubscribeEngine();
            listeners.clear();
        }
    };
}

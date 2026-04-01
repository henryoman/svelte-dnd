import { type InteractionKind, type Point, type ResizeHandle, type TransformSnapshot } from '../core/types.js';
export interface TransformSessionOptions {
    kind: InteractionKind;
    pointerStart: Point;
    transformStart: TransformSnapshot;
    handle?: ResizeHandle;
    pixelSnap?: boolean;
    lockAspectRatio?: boolean;
}
export declare function updateTransformSession(options: TransformSessionOptions, pointerCurrent: Point): TransformSnapshot;

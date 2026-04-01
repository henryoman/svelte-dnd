import type { NodeId, Rect } from './types.js';
export declare class MeasurementCache {
    private rects;
    measure(id: NodeId, element: HTMLElement): Rect;
    get(id: NodeId): Rect | undefined;
    invalidate(id?: NodeId): void;
}

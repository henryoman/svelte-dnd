import type { Point, Rect } from '../core/types.js';
export declare function rectFromDomRect(domRect: DOMRect | DOMRectReadOnly): Rect;
export declare function pointInRect(point: Point, rect: Rect): boolean;
export declare function translateRect(rect: Rect, delta: Point): Rect;

import type { Point, Rect } from '../core/types.js';

export function rectFromDomRect(domRect: DOMRect | DOMRectReadOnly): Rect {
	return {
		x: domRect.x,
		y: domRect.y,
		width: domRect.width,
		height: domRect.height
	};
}

export function pointInRect(point: Point, rect: Rect): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}

export function translateRect(rect: Rect, delta: Point): Rect {
	return {
		...rect,
		x: rect.x + delta.x,
		y: rect.y + delta.y
	};
}

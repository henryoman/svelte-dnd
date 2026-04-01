import type { NodeId, Rect } from './types.js';
import { rectFromDomRect } from '../geometry/rect.js';

export class MeasurementCache {
	private rects = new Map<NodeId, Rect>();

	measure(id: NodeId, element: HTMLElement): Rect {
		const rect = rectFromDomRect(element.getBoundingClientRect());
		this.rects.set(id, rect);
		return rect;
	}

	get(id: NodeId): Rect | undefined {
		return this.rects.get(id);
	}

	invalidate(id?: NodeId): void {
		if (id) {
			this.rects.delete(id);
			return;
		}

		this.rects.clear();
	}
}

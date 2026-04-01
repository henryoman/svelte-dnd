import { rectFromDomRect } from '../geometry/rect.js';
export class MeasurementCache {
    rects = new Map();
    measure(id, element) {
        const rect = rectFromDomRect(element.getBoundingClientRect());
        this.rects.set(id, rect);
        return rect;
    }
    get(id) {
        return this.rects.get(id);
    }
    invalidate(id) {
        if (id) {
            this.rects.delete(id);
            return;
        }
        this.rects.clear();
    }
}

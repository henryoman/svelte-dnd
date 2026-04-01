export function rectFromDomRect(domRect) {
    return {
        x: domRect.x,
        y: domRect.y,
        width: domRect.width,
        height: domRect.height
    };
}
export function pointInRect(point, rect) {
    return (point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height);
}
export function translateRect(rect, delta) {
    return {
        ...rect,
        x: rect.x + delta.x,
        y: rect.y + delta.y
    };
}

import { afterEach, beforeEach } from 'bun:test';
export function createMockElement(rect) {
    return {
        getBoundingClientRect() {
            return {
                ...rect,
                top: rect.y,
                right: rect.x + rect.width,
                bottom: rect.y + rect.height,
                left: rect.x
            };
        }
    };
}
export function installAnimationFrameMock() {
    const originalRequest = globalThis.requestAnimationFrame;
    const originalCancel = globalThis.cancelAnimationFrame;
    beforeEach(() => {
        globalThis.requestAnimationFrame = ((callback) => {
            return setTimeout(() => callback(performance.now()), 0);
        });
        globalThis.cancelAnimationFrame = ((handle) => {
            clearTimeout(handle);
        });
    });
    afterEach(() => {
        globalThis.requestAnimationFrame = originalRequest;
        globalThis.cancelAnimationFrame = originalCancel;
    });
}
export async function flushAnimationFrame() {
    await new Promise((resolve) => setTimeout(resolve, 5));
}

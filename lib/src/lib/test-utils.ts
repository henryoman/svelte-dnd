import { afterEach, beforeEach } from 'bun:test';

interface RectInit {
	x: number;
	y: number;
	width: number;
	height: number;
}

export function createMockElement(rect: RectInit): HTMLElement {
	return {
		getBoundingClientRect() {
			return {
				...rect,
				top: rect.y,
				right: rect.x + rect.width,
				bottom: rect.y + rect.height,
				left: rect.x
			} as DOMRect;
		}
	} as HTMLElement;
}

export function installAnimationFrameMock(): void {
	const originalRequest = globalThis.requestAnimationFrame;
	const originalCancel = globalThis.cancelAnimationFrame;

	beforeEach(() => {
		globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
			return setTimeout(() => callback(performance.now()), 0) as unknown as number;
		}) as typeof requestAnimationFrame;

		globalThis.cancelAnimationFrame = ((handle: number) => {
			clearTimeout(handle);
		}) as typeof cancelAnimationFrame;
	});

	afterEach(() => {
		globalThis.requestAnimationFrame = originalRequest;
		globalThis.cancelAnimationFrame = originalCancel;
	});
}

export async function flushAnimationFrame(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 5));
}

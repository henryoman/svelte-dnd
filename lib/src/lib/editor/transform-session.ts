import {
	type InteractionKind,
	type Point,
	type ResizeHandle,
	type TransformSnapshot
} from '../core/types.js';

export interface TransformSessionOptions {
	kind: InteractionKind;
	pointerStart: Point;
	transformStart: TransformSnapshot;
	handle?: ResizeHandle;
	pixelSnap?: boolean;
	lockAspectRatio?: boolean;
}

function maybeSnap(value: number, pixelSnap: boolean): number {
	return pixelSnap ? Math.round(value) : value;
}

function clampScale(value: number): number {
	return Math.max(0.01, value);
}

function axisSign(handle: ResizeHandle, positive: ResizeHandle, negative: ResizeHandle): number {
	if (handle.includes(positive)) {
		return 1;
	}

	if (handle.includes(negative)) {
		return -1;
	}

	return 0;
}

export function updateTransformSession(
	options: TransformSessionOptions,
	pointerCurrent: Point
): TransformSnapshot {
	const deltaX = pointerCurrent.x - options.pointerStart.x;
	const deltaY = pointerCurrent.y - options.pointerStart.y;

	if (options.kind === 'drag') {
		return {
			...options.transformStart,
			x: maybeSnap(options.transformStart.x + deltaX, options.pixelSnap ?? false),
			y: maybeSnap(options.transformStart.y + deltaY, options.pixelSnap ?? false)
		};
	}

	if (options.kind === 'resize') {
		const next = { ...options.transformStart };
		const handle = options.handle ?? 'se';
		const pixelSnap = options.pixelSnap ?? false;

		if (options.lockAspectRatio) {
			const horizontal = axisSign(handle, 'e', 'w');
			const vertical = axisSign(handle, 's', 'n');
			const activeAxes = Number(horizontal !== 0) + Number(vertical !== 0) || 1;
			const projectedDelta = (deltaX * horizontal + deltaY * vertical) / activeAxes;
			const factor = clampScale(1 + projectedDelta / 140);

			next.scaleX = clampScale(options.transformStart.scaleX * factor);
			next.scaleY = clampScale(options.transformStart.scaleY * factor);

			if (horizontal < 0) {
				next.x = maybeSnap(options.transformStart.x + deltaX, pixelSnap);
			}

			if (vertical < 0) {
				next.y = maybeSnap(options.transformStart.y + deltaY, pixelSnap);
			}

			return next;
		}

		if (handle.includes('e')) {
			next.scaleX = clampScale(options.transformStart.scaleX + deltaX / 100);
		}

		if (handle.includes('w')) {
			next.scaleX = clampScale(options.transformStart.scaleX - deltaX / 100);
			next.x = maybeSnap(options.transformStart.x + deltaX, pixelSnap);
		}

		if (handle.includes('s')) {
			next.scaleY = clampScale(options.transformStart.scaleY + deltaY / 100);
		}

		if (handle.includes('n')) {
			next.scaleY = clampScale(options.transformStart.scaleY - deltaY / 100);
			next.y = maybeSnap(options.transformStart.y + deltaY, pixelSnap);
		}

		return next;
	}

	return options.transformStart;
}

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
			const candidateScaleX = handle.includes('e')
				? options.transformStart.scaleX + deltaX / 100
				: handle.includes('w')
					? options.transformStart.scaleX - deltaX / 100
					: options.transformStart.scaleX;
			const candidateScaleY = handle.includes('s')
				? options.transformStart.scaleY + deltaY / 100
				: handle.includes('n')
					? options.transformStart.scaleY - deltaY / 100
					: options.transformStart.scaleY;
			const factorFromX =
				options.transformStart.scaleX === 0
					? 1
					: clampScale(candidateScaleX) / options.transformStart.scaleX;
			const factorFromY =
				options.transformStart.scaleY === 0
					? 1
					: clampScale(candidateScaleY) / options.transformStart.scaleY;
			const useX =
				(handle.includes('e') || handle.includes('w')) &&
				((!handle.includes('n') && !handle.includes('s')) || Math.abs(deltaX) >= Math.abs(deltaY));
			const factor =
				useX || (!handle.includes('n') && !handle.includes('s')) ? factorFromX : factorFromY;

			next.scaleX = clampScale(options.transformStart.scaleX * factor);
			next.scaleY = clampScale(options.transformStart.scaleY * factor);

			if (handle.includes('w')) {
				next.x = maybeSnap(options.transformStart.x + deltaX, pixelSnap);
			}

			if (handle.includes('n')) {
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

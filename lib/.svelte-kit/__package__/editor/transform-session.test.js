import { describe, expect, test } from 'bun:test';
import { updateTransformSession } from './transform-session.js';
import { identityTransform } from '../core/types.js';
describe('updateTransformSession', () => {
    test('moves drag interactions with optional pixel snapping', () => {
        const start = {
            ...identityTransform(),
            x: 10,
            y: 12
        };
        expect(updateTransformSession({
            kind: 'drag',
            pointerStart: { x: 0, y: 0 },
            transformStart: start,
            pixelSnap: true
        }, { x: 10.4, y: 13.6 })).toEqual({
            ...start,
            x: 20,
            y: 26
        });
    });
    test('anchors west and north resize handles while shrinking from the origin', () => {
        const start = {
            ...identityTransform(),
            x: 100,
            y: 200,
            scaleX: 1,
            scaleY: 1
        };
        expect(updateTransformSession({
            kind: 'resize',
            handle: 'nw',
            pointerStart: { x: 0, y: 0 },
            transformStart: start,
            pixelSnap: true
        }, { x: 25, y: 40 })).toEqual({
            ...start,
            x: 125,
            y: 240,
            scaleX: 0.75,
            scaleY: 0.6
        });
    });
    test('keeps scale ratio locked when aspect locking is enabled', () => {
        const start = {
            ...identityTransform(),
            scaleX: 1.2,
            scaleY: 0.8
        };
        const next = updateTransformSession({
            kind: 'resize',
            handle: 'se',
            pointerStart: { x: 0, y: 0 },
            transformStart: start,
            lockAspectRatio: true
        }, { x: 20, y: 8 });
        expect(next.x).toBe(0);
        expect(next.y).toBe(0);
        expect(next.scaleX).toBeCloseTo(1.4);
        expect(next.scaleY).toBeCloseTo(0.9333333333333335);
    });
});

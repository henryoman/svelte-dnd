import type { EditorController, NodeId, Point, TransformSnapshot } from '../../core/types.js';
export declare function eventPoint(event: PointerEvent): Point;
export declare function transformToCss(transform: TransformSnapshot): string;
export declare function bindPreviewTransform(element: HTMLElement, controller: EditorController, id: NodeId): () => void;
export declare function finishPointerInteraction(element: HTMLElement, pointerId: number, onFinish: () => void): void;

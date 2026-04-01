export type NodeId = string;
export type InteractionKind = 'drag' | 'resize' | 'rotate';
export type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
export interface Point {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface Rect extends Point, Size {
}
export interface TransformSnapshot {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
}
export type TransformInput = Partial<TransformSnapshot> | TransformSnapshot;
export interface DraggableRegistration {
    id: NodeId;
    element: HTMLElement;
    data?: Record<string, unknown>;
}
export interface DroppableRegistration {
    id: NodeId;
    element: HTMLElement;
    data?: Record<string, unknown>;
}
export interface InteractionState {
    kind: InteractionKind;
    nodeId: NodeId;
    pointerStart: Point;
    pointerCurrent: Point;
    transformStart: TransformSnapshot;
    transformCurrent: TransformSnapshot;
    handle?: ResizeHandle;
    lockAspectRatio?: boolean;
}
export interface CommittedInteraction {
    kind: InteractionKind;
    nodeId: NodeId;
    transform: TransformSnapshot;
    overId: NodeId | null;
}
export interface EditorEngineSnapshot {
    active: InteractionState | null;
    draggableCount: number;
    droppableCount: number;
    hoveredDroppableId: NodeId | null;
}
export interface EditorEngineOptions {
    pixelSnap?: boolean;
}
export interface BeginInteractionInput {
    kind: InteractionKind;
    nodeId: NodeId;
    pointer: Point;
    transform: TransformSnapshot;
    handle?: ResizeHandle;
    lockAspectRatio?: boolean;
}
export interface EditorEngine {
    registerDraggable(registration: DraggableRegistration): () => void;
    registerDroppable(registration: DroppableRegistration): () => void;
    snapshotMeasurements(): void;
    beginInteraction(input: BeginInteractionInput): void;
    updatePointer(pointer: Point): void;
    getSnapshot(): EditorEngineSnapshot;
    getPreviewTransform(): TransformSnapshot | null;
    commitInteraction(): CommittedInteraction | null;
    cancelInteraction(): void;
    subscribe(listener: (snapshot: EditorEngineSnapshot) => void): () => void;
}
export interface EditorControllerOptions extends EditorEngineOptions {
    initialTransforms?: Record<NodeId, TransformInput> | Iterable<readonly [NodeId, TransformInput]>;
}
export interface EditorControllerSnapshot {
    active: InteractionState | null;
    hoveredDroppableId: NodeId | null;
    transforms: ReadonlyMap<NodeId, TransformSnapshot>;
    previewTransforms: ReadonlyMap<NodeId, TransformSnapshot>;
}
export interface EditorController {
    engine: EditorEngine;
    registerTransform(id: NodeId, transform?: TransformInput): void;
    setTransform(id: NodeId, transform: TransformInput): void;
    getTransform(id: NodeId): TransformSnapshot;
    getLiveTransform(id: NodeId): TransformSnapshot;
    getSnapshot(): EditorControllerSnapshot;
    commitActive(): CommittedInteraction | null;
    cancelActive(): void;
    subscribe(listener: (snapshot: EditorControllerSnapshot) => void): () => void;
    destroy(): void;
}
export declare const identityTransform: () => TransformSnapshot;

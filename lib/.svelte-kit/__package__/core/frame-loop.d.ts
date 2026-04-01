export declare class FrameLoop {
    private readonly callback;
    private frame;
    private queued;
    constructor(callback: () => void);
    request(): void;
    cancel(): void;
}

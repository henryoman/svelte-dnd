export class FrameLoop {
    callback;
    frame = 0;
    queued = false;
    constructor(callback) {
        this.callback = callback;
    }
    request() {
        if (this.queued) {
            return;
        }
        this.queued = true;
        this.frame = requestAnimationFrame(() => {
            this.queued = false;
            this.callback();
        });
    }
    cancel() {
        if (this.frame !== 0) {
            cancelAnimationFrame(this.frame);
        }
        this.frame = 0;
        this.queued = false;
    }
}

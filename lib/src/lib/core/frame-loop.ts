export class FrameLoop {
	private frame = 0;
	private queued = false;

	constructor(private readonly callback: () => void) {}

	request(): void {
		if (this.queued) {
			return;
		}

		this.queued = true;
		this.frame = requestAnimationFrame(() => {
			this.queued = false;
			this.callback();
		});
	}

	cancel(): void {
		if (this.frame !== 0) {
			cancelAnimationFrame(this.frame);
		}

		this.frame = 0;
		this.queued = false;
	}
}

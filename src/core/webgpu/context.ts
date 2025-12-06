export interface WebGPUContext {
	device: GPUDevice;
	adapter: GPUAdapter;
}

export function isWebGPUAvailable(): boolean {
	return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function initWebGPU(): Promise<WebGPUContext | null> {
	if (!isWebGPUAvailable()) {
		console.warn("WebGPU is not supported in this browser");
		return null;
	}

	try {
		const adapter = await navigator.gpu.requestAdapter({
			powerPreference: "high-performance",
		});

		if (!adapter) {
			console.warn("No WebGPU adapter found");
			return null;
		}

		const device = await adapter.requestDevice();

		device.lost.then((info) => {
			console.error(`WebGPU device was lost: ${info.message}`);
			if (info.reason !== "destroyed") {
				console.warn("Attempting to recover WebGPU device...");
			}
		});

		return { device, adapter };
	} catch (error) {
		console.warn("Failed to initialize WebGPU:", error);
		return null;
	}
}

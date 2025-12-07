import { createSignal, Show } from "solid-js";
import { Button } from "./Button";

export const WebGPUWarningDialog = () => {
	const [isDismissed, setIsDismissed] = createSignal(false);

	const handleDismiss = () => {
		setIsDismissed(true);
	};

	return (
		<Show when={!isDismissed()}>
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
				<div class="glass-popover p-6 max-w-sm mx-4 rounded-2xl">
					<p class="text-gray-300 mb-5 text-sm leading-relaxed">
						Your device or browser does not support WebGPU. This simulation
						requires WebGPU to run. Please try using a browser that supports
						WebGPU, such as Chrome 113+, Edge 113+, or Safari 18+.
					</p>
					<div class="flex justify-end">
						<Button onClick={handleDismiss}>OK</Button>
					</div>
				</div>
			</div>
		</Show>
	);
};

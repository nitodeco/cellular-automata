import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Button } from "../Button";

export interface ResolutionPreset {
	label: string;
	width: number;
	height: number;
}

interface Props {
	viewportWidth: number;
	viewportHeight: number;
	onExport: (width: number, height: number) => void;
	isExporting: () => boolean;
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
	{ label: "1080p", width: 1920, height: 1080 },
	{ label: "1440p", width: 2560, height: 1440 },
	{ label: "4K", width: 3840, height: 2160 },
];

export const ExportControl = (props: Props) => {
	const [dropdownOpen, setDropdownOpen] = createSignal(false);
	let containerRef: HTMLDivElement | undefined;

	function handleExport(width: number, height: number) {
		setDropdownOpen(false);
		props.onExport(width, height);
	}

	function handleViewportExport() {
		handleExport(props.viewportWidth, props.viewportHeight);
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			containerRef &&
			!containerRef.contains(event.target as Node) &&
			dropdownOpen()
		) {
			setDropdownOpen(false);
		}
	}

	function setContainerRef(el: HTMLDivElement) {
		containerRef = el;
	}

	onMount(() => {
		document.addEventListener("mousedown", handleClickOutside);
	});

	onCleanup(() => {
		document.removeEventListener("mousedown", handleClickOutside);
	});

	return (
		<div class="relative" ref={setContainerRef}>
			<Button
				onClick={() => setDropdownOpen(!dropdownOpen())}
				class="px-4 py-2 min-w-[48px] flex items-center justify-center gap-2"
				aria-label="Export wallpaper"
			>
				<Show
					when={props.isExporting()}
					fallback={<i class="hn hn-download w-5 h-5" />}
				>
					<div class="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
				</Show>
			</Button>

			<Show when={dropdownOpen() && !props.isExporting()}>
				<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 border-2 border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.6)] min-w-[120px] z-20 pointer-events-auto">
					<button
						type="button"
						onClick={handleViewportExport}
						class="w-full px-2 py-1 text-left text-xs text-gray-200 hover:bg-gray-700 border-b border-gray-600 cursor-pointer"
					>
						Viewport ({props.viewportWidth}x{props.viewportHeight})
					</button>
					{RESOLUTION_PRESETS.map((preset) => (
						<button
							type="button"
							onClick={() => handleExport(preset.width, preset.height)}
							class="w-full px-2 py-1 text-left text-xs text-gray-200 hover:bg-gray-700 border-b border-gray-600 last:border-b-0 cursor-pointer"
						>
							{preset.label} ({preset.width}x{preset.height})
						</button>
					))}
				</div>
			</Show>
		</div>
	);
};

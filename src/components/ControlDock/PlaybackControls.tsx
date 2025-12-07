import { Pause, Play, RotateCcw, Sparkles } from "lucide-solid";
import { Show } from "solid-js";
import { Button } from "../Button";

interface PlaybackControlsProps {
	running: () => boolean;
	onPlayPause: () => void;
	onRandomize: () => void;
	onClear: () => void;
}

export const PlaybackControls = (props: PlaybackControlsProps) => {
	return (
		<div class="flex flex-wrap justify-center items-center gap-3">
			<Show
				when={props.running()}
				fallback={
					<Button
						onClick={props.onPlayPause}
						variant="play"
						class="px-4 py-2 min-w-[48px] flex items-center justify-center"
						aria-label="Play"
					>
						<Play class="w-5 h-5" />
					</Button>
				}
			>
				<Button
					onClick={props.onPlayPause}
					variant="stop"
					class="px-4 py-2 min-w-[48px] flex items-center justify-center"
					aria-label="Pause"
				>
					<Pause class="w-5 h-5" />
				</Button>
			</Show>

			<Button
				onClick={props.onRandomize}
				variant="accent"
				class="px-4 py-2 min-w-[48px] flex items-center justify-center"
				aria-label="Randomize settings"
			>
				<Sparkles class="w-5 h-5" />
			</Button>

			<div class="h-8 w-px bg-white/10 mx-2 hidden md:block" />

			<Button
				onClick={props.onClear}
				class="px-4 py-2 min-w-[48px] flex items-center justify-center"
				aria-label="Reset"
			>
				<RotateCcw class="w-5 h-5" />
			</Button>
		</div>
	);
};

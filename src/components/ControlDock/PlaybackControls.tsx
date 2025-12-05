import { Button } from "../Button";

interface PlaybackControlsProps {
	running: () => boolean;
	onPlayPause: () => void;
	onStep: () => void;
	onRandom: () => void;
	onClear: () => void;
}

export const PlaybackControls = (props: PlaybackControlsProps) => {
	return (
		<div class="flex flex-wrap justify-center items-center gap-3">
			<div class="flex items-center gap-2">
				<Button
					onClick={props.onPlayPause}
					variant={props.running() ? "stop" : "play"}
					class="px-4 py-2 min-w-[48px] flex items-center justify-center"
				>
					{props.running() ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-5 h-5"
							aria-label="Pause"
						>
							<title>Pause</title>
							<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-5 h-5"
							aria-label="Play"
						>
							<title>Play</title>
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</Button>
				<Button onClick={props.onStep}>STEP</Button>
			</div>

			<div class="h-8 w-px bg-gray-700 mx-2 hidden md:block" />

			<div class="flex items-center gap-2">
				<Button onClick={props.onRandom}>RND</Button>
				<Button onClick={props.onClear}>CLR</Button>
			</div>
		</div>
	);
};

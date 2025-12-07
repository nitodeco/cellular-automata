interface SpeedControlProps {
	speed: () => number;
	onSpeedChange: (speed: number) => void;
}

export const SpeedControl = (props: SpeedControlProps) => {
	return (
		<div class="flex flex-col gap-1">
			<div class="flex justify-between items-center text-[10px] uppercase tracking-wider font-medium text-gray-400">
				<span>Speed</span>
				<span>{props.speed()}</span>
			</div>
			<input
				type="range"
				min="0"
				max="100"
				value={props.speed()}
				onInput={(event) =>
					props.onSpeedChange(Number.parseInt(event.currentTarget.value, 10))
				}
				class="glass-slider w-full cursor-pointer"
			/>
		</div>
	);
};

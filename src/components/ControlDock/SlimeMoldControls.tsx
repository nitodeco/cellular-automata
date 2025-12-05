import type { SlimeConfig } from "../../core/slime";

interface SlimeMoldControlsProps {
	slimeConfig: () => SlimeConfig;
	onSlimeConfigChange: (key: keyof SlimeConfig, value: number | string) => void;
}

export const SlimeMoldControls = (props: SlimeMoldControlsProps) => {
	return (
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-gray-700">
			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Color</span>
					<span>{props.slimeConfig().color}</span>
				</div>
				<input
					type="color"
					value={props.slimeConfig().color}
					onInput={(event) =>
						props.onSlimeConfigChange("color", event.currentTarget.value)
					}
					class="w-full h-8 cursor-pointer bg-transparent border-none"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Sensor Angle</span>
					<span>
						{Math.round((props.slimeConfig().sensorAngle * 180) / Math.PI)}°
					</span>
				</div>
				<input
					type="range"
					min="0"
					max="180"
					value={(props.slimeConfig().sensorAngle * 180) / Math.PI}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"sensorAngle",
							(Number.parseFloat(event.currentTarget.value) * Math.PI) / 180,
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Turn Angle</span>
					<span>
						{Math.round((props.slimeConfig().turnAngle * 180) / Math.PI)}°
					</span>
				</div>
				<input
					type="range"
					min="0"
					max="180"
					value={(props.slimeConfig().turnAngle * 180) / Math.PI}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"turnAngle",
							(Number.parseFloat(event.currentTarget.value) * Math.PI) / 180,
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Sensor Dist</span>
					<span>{props.slimeConfig().sensorDist}px</span>
				</div>
				<input
					type="range"
					min="1"
					max="64"
					value={props.slimeConfig().sensorDist}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"sensorDist",
							Number.parseFloat(event.currentTarget.value),
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Decay Rate</span>
					<span>{props.slimeConfig().decayRate.toFixed(1)}</span>
				</div>
				<input
					type="range"
					min="0.1"
					max="20"
					step="0.1"
					value={props.slimeConfig().decayRate}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"decayRate",
							Number.parseFloat(event.currentTarget.value),
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Diffuse Weight</span>
					<span>{props.slimeConfig().diffuseWeight.toFixed(2)}</span>
				</div>
				<input
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={props.slimeConfig().diffuseWeight}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"diffuseWeight",
							Number.parseFloat(event.currentTarget.value),
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Deposit Amount</span>
					<span>{props.slimeConfig().depositAmount}</span>
				</div>
				<input
					type="range"
					min="1"
					max="255"
					value={props.slimeConfig().depositAmount}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"depositAmount",
							Number.parseFloat(event.currentTarget.value),
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Agent Speed</span>
					<span>{props.slimeConfig().agentSpeed.toFixed(1)}</span>
				</div>
				<input
					type="range"
					min="0.1"
					max="5"
					step="0.1"
					value={props.slimeConfig().agentSpeed}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"agentSpeed",
							Number.parseFloat(event.currentTarget.value),
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<div class="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400">
					<span>Agent Count</span>
					<span>{props.slimeConfig().agentCount}%</span>
				</div>
				<input
					type="range"
					min="0.5"
					max="20"
					step="0.5"
					value={props.slimeConfig().agentCount}
					onInput={(event) =>
						props.onSlimeConfigChange(
							"agentCount",
							Number.parseFloat(event.currentTarget.value),
						)
					}
					class="pixel-slider w-full cursor-pointer"
				/>
			</div>
		</div>
	);
};

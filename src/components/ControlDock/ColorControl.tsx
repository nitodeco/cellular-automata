import { For } from "solid-js";
import {
	COLOR_PRESETS,
	type ColorPreset,
	type ColorPresetName,
	getColorPreset,
} from "../../core/slime";
import { Popover } from "../Popover";

const presetEntries = Object.entries(COLOR_PRESETS) as [
	ColorPresetName,
	ColorPreset,
][];

interface ColorControlProps {
	selectedPreset: () => ColorPresetName;
	onPresetChange: (presetName: ColorPresetName) => void;
}

export const ColorControl = (props: ColorControlProps) => {
	return (
		<div class="flex items-center gap-3 bg-gray-900/40 px-3 py-2 border-2 border-gray-700/30 rounded-sm">
			<Popover
				trigger={({ toggle }) => {
					const currentPreset = getColorPreset(props.selectedPreset());
					return (
						<button
							type="button"
							onClick={toggle}
							class="w-16 h-8 rounded-sm border-2 border-gray-600 hover:border-gray-400 transition-colors shadow-sm cursor-pointer"
							style={{
								"background-image": `linear-gradient(90deg, ${currentPreset.low}, ${currentPreset.mid}, ${currentPreset.high})`,
							}}
							aria-label="Select palette"
						/>
					);
				}}
			>
				{({ close }) => (
					<div class="preset-list flex flex-col gap-2 min-w-[120px] max-h-[250px] overflow-y-auto">
						<For each={presetEntries}>
							{([presetName, presetColors]) => {
								const isActive = props.selectedPreset() === presetName;

								return (
									<button
										type="button"
										onClick={() => {
											props.onPresetChange(presetName);
											close();
										}}
										class={`flex items-center gap-2 p-1 rounded-sm hover:bg-gray-700/50 transition-colors w-full text-left cursor-pointer ${
											isActive ? "bg-gray-700/80" : ""
										}`}
									>
										<div
											class={`w-8 h-6 rounded-sm border ${
												isActive ? "border-white" : "border-gray-600"
											}`}
											style={{
												"background-image": `linear-gradient(90deg, ${presetColors.low}, ${presetColors.mid}, ${presetColors.high})`,
											}}
										/>
										<span
											class={`text-xs uppercase font-bold tracking-wider ${
												isActive ? "text-white" : "text-gray-400"
											}`}
										>
											{presetName}
										</span>
									</button>
								);
							}}
						</For>
					</div>
				)}
			</Popover>
		</div>
	);
};

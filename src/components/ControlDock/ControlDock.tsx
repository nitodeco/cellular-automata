import type { RuleName } from "../../core/rules";
import type { SlimeConfig } from "../../core/slime";
import { PlaybackControls } from "./PlaybackControls";
import { RuleSelector } from "./RuleSelector";
import { SlimeMoldControls } from "./SlimeMoldControls";
import { SpeedControl } from "./SpeedControl";

interface Props {
	rule: () => RuleName;
	running: () => boolean;
	speed: () => number;
	slimeConfig: () => SlimeConfig;
	onRuleChange: (event: Event) => void;
	onPlayPause: () => void;
	onStep: () => void;
	onRandom: () => void;
	onClear: () => void;
	onSpeedChange: (event: Event) => void;
	onSlimeConfigChange: (key: keyof SlimeConfig, value: number | string) => void;
}

export const ControlDock = (props: Props) => {
	return (
		<div class="absolute bottom-8 left-0 w-full z-10 flex justify-center pointer-events-none px-4">
			<div class="pointer-events-auto bg-gray-800/95 backdrop-blur-sm border-2 border-gray-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3 w-full max-w-[95vw] md:max-w-4xl max-h-[80vh] overflow-y-auto">
				<div class="flex flex-row flex-wrap items-center justify-center gap-4 md:gap-8">
					<RuleSelector rule={props.rule} onRuleChange={props.onRuleChange} />
					<PlaybackControls
						running={props.running}
						onPlayPause={props.onPlayPause}
						onStep={props.onStep}
						onRandom={props.onRandom}
						onClear={props.onClear}
					/>
					<SpeedControl
						speed={props.speed}
						onSpeedChange={props.onSpeedChange}
					/>
				</div>

				{props.rule() === "slime" && (
					<SlimeMoldControls
						slimeConfig={props.slimeConfig}
						onSlimeConfigChange={props.onSlimeConfigChange}
					/>
				)}
			</div>
		</div>
	);
};

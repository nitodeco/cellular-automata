import type { RuleName } from "../../core/rules";

interface RuleSelectorProps {
	rule: () => RuleName;
	onRuleChange: (event: Event) => void;
}

export const RuleSelector = (props: RuleSelectorProps) => {
	return (
		<div class="flex items-center">
			<select
				value={props.rule()}
				onChange={props.onRuleChange}
				class="w-full md:w-48 bg-gray-900 text-gray-200 text-xs md:text-sm border-2 border-gray-600 px-3 py-2 focus:outline-none focus:border-gray-400 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-px active:shadow-none hover:bg-gray-800 transition-colors font-bold"
			>
				<option value="conway">Conway's Life</option>
				<option value="briansbrain">Brian's Brain</option>
				<option value="slime">Slime Mold</option>
			</select>
		</div>
	);
};

import { ChevronDown, ChevronUp } from "lucide-solid";

interface Props {
	collapsed: () => boolean;
	onClick: () => void;
}

export const CollapseButton = (props: Props) => {
	return (
		<button
			type="button"
			onClick={props.onClick}
			class="collapse-button absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[calc(100%-1px)] px-4 aspect-2/1 cursor-pointer z-30 pointer-events-auto flex items-center justify-center rounded-t-xl"
			aria-label={props.collapsed() ? "Expand controls" : "Collapse controls"}
		>
			{props.collapsed() ? (
				<ChevronUp class="w-4 h-4 text-white/70" />
			) : (
				<ChevronDown class="w-4 h-4 text-white/70" />
			)}
		</button>
	);
};

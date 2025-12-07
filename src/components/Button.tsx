import type { JSX } from "solid-js";

interface Props {
	onClick: () => void;
	children: JSX.Element;
	variant?: "default" | "play" | "stop" | "accent" | "shift";
	class?: string;
	"aria-label"?: string;
}

export const Button = (props: Props) => {
	const baseClasses =
		"glass-button px-3 py-1.5 text-gray-100 cursor-pointer rounded-xl";

	const variantClasses = {
		default: "",
		play: "!bg-gradient-to-br !from-green-500/25 !to-green-600/15 !border-green-400/25 hover:!border-green-400/40 text-green-100",
		stop: "!bg-gradient-to-br !from-red-500/25 !to-red-600/15 !border-red-400/25 hover:!border-red-400/40 text-red-100",
		accent: "button-gradient-accent text-white",
		shift:
			"!bg-gradient-to-br !from-blue-500/40 !to-blue-600/30 !border-blue-400/40 hover:!border-blue-400/50 text-blue-100",
	};

	const getClasses = () => {
		const variant = props.variant ?? "default";
		return `${baseClasses} ${variantClasses[variant]} ${props.class ?? ""}`;
	};

	return (
		<button
			type="button"
			onClick={props.onClick}
			class={getClasses()}
			aria-label={props["aria-label"]}
		>
			{props.children}
		</button>
	);
};

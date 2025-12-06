interface Props {
	canvasRef: (el: HTMLCanvasElement) => void;
	width: number;
	height: number;
}

export const Canvas = (props: Props) => {
	return (
		<canvas
			ref={props.canvasRef}
			width={props.width}
			height={props.height}
			class="absolute top-0 left-0 block touch-none"
			onContextMenu={(e) => e.preventDefault()}
		/>
	);
};

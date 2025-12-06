import { type Accessor, onCleanup, onMount } from "solid-js";
import { GRID_COLS, GRID_ROWS, TOTAL_HEIGHT, TOTAL_WIDTH } from "../constants";
import type { Grid } from "../core/grid";
import type { SlimeConfig } from "../core/slime";
import {
	type ColorPresetFloats,
	type ColorPresetName,
	getColorPresetFloats,
} from "../core/slime";
import type { Viewport } from "./useViewport";

const baseColorValue = Math.round(0.039 * 255);
const baseColor = {
	red: baseColorValue,
	green: baseColorValue,
	blue: baseColorValue,
};

let cachedPresetName = "";
let cachedPresetFloats: ColorPresetFloats | null = null;

function mixChannel(start: number, end: number, amount: number): number {
	return start + (end - start) * amount;
}

function ensurePresetFloats(presetName: ColorPresetName): ColorPresetFloats {
	if (cachedPresetFloats === null || presetName !== cachedPresetName) {
		cachedPresetFloats = getColorPresetFloats(presetName);
		cachedPresetName = presetName;
	}
	return cachedPresetFloats;
}

export function useGridRenderer(
	canvasRef: () => HTMLCanvasElement | undefined,
	grid: () => Grid,
	viewport: () => Viewport,
	canvasSize: () => { width: number; height: number },
	slimeConfig: () => SlimeConfig,
	useWebGPU: Accessor<boolean>,
	gpuAvailable: Accessor<boolean>,
	gpuInitializing: Accessor<boolean>,
) {
	const offscreen = new OffscreenCanvas(GRID_COLS, GRID_ROWS);
	const offscreenCtx = offscreen.getContext("2d", {
		willReadFrequently: false,
	});
	const imageData = offscreenCtx?.createImageData(GRID_COLS, GRID_ROWS);
	const data32 = imageData ? new Uint32Array(imageData.data.buffer) : null;

	function renderGrid() {
		if (gpuInitializing() || (useWebGPU() && gpuAvailable())) {
			return;
		}

		const canvas = canvasRef();
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext("2d");

		if (!ctx) {
			return;
		}

		const { width, height } = canvasSize();
		const { x, y, zoom } = viewport();

		ctx.fillStyle = "#0a0a0f";
		ctx.fillRect(0, 0, width, height);

		const currentGrid = grid();

		if (offscreenCtx && imageData && data32) {
			const gridData = currentGrid.data;
			const presetName = slimeConfig().colorPreset;
			const presetFloats = ensurePresetFloats(presetName);

			const gridLength = gridData.length;
			for (let cellIndex = 0; cellIndex < gridLength; cellIndex++) {
				const normalizedIntensity = gridData[cellIndex] / 255;
				const curvedIntensity = normalizedIntensity ** 2.2;

				const blendValue =
					curvedIntensity < 0.5
						? curvedIntensity * 2
						: (curvedIntensity - 0.5) * 2;

				const startColor =
					curvedIntensity < 0.5 ? presetFloats.low : presetFloats.mid;
				const endColor =
					curvedIntensity < 0.5 ? presetFloats.mid : presetFloats.high;

				const gradientRed = mixChannel(startColor[0], endColor[0], blendValue);
				const gradientGreen = mixChannel(
					startColor[1],
					endColor[1],
					blendValue,
				);
				const gradientBlue = mixChannel(startColor[2], endColor[2], blendValue);

				const finalRed = Math.round(
					mixChannel(baseColor.red, gradientRed * 255, curvedIntensity),
				);
				const finalGreen = Math.round(
					mixChannel(baseColor.green, gradientGreen * 255, curvedIntensity),
				);
				const finalBlue = Math.round(
					mixChannel(baseColor.blue, gradientBlue * 255, curvedIntensity),
				);

				data32[cellIndex] =
					(255 << 24) | (finalBlue << 16) | (finalGreen << 8) | finalRed;
			}

			offscreenCtx.putImageData(imageData, 0, 0);

			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(
				offscreen,
				0,
				0,
				GRID_COLS,
				GRID_ROWS,
				x,
				y,
				TOTAL_WIDTH * zoom,
				TOTAL_HEIGHT * zoom,
			);
		}
	}

	onMount(() => {
		let animationFrameId: number;

		function loop() {
			renderGrid();
			animationFrameId = requestAnimationFrame(loop);
		}
		loop();

		onCleanup(() => {
			cancelAnimationFrame(animationFrameId);
		});
	});
}

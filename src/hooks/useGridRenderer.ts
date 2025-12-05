import { onCleanup, onMount } from "solid-js";
import {
	CELL_SIZE,
	GRID_COLS,
	GRID_ROWS,
	TOTAL_HEIGHT,
	TOTAL_WIDTH,
} from "../constants";
import { type Grid, getCell } from "../core/grid";
import type { RuleName } from "../core/rules";
import type { SlimeConfig } from "../core/slime";
import type { Viewport } from "./useViewport";

export function useGridRenderer(
	canvasRef: () => HTMLCanvasElement | undefined,
	grid: () => Grid,
	viewport: () => Viewport,
	canvasSize: () => { width: number; height: number },
	rule: () => RuleName,
	slimeConfig: () => SlimeConfig,
) {
	const offscreenCanvas = document.createElement("canvas");
	offscreenCanvas.width = GRID_COLS;
	offscreenCanvas.height = GRID_ROWS;
	const offscreenCtx = offscreenCanvas.getContext("2d");
	const imageData = offscreenCtx?.createImageData(GRID_COLS, GRID_ROWS);

	function hexToRgb(hex: string) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: Number.parseInt(result[1], 16),
					g: Number.parseInt(result[2], 16),
					b: Number.parseInt(result[3], 16),
				}
			: { r: 0, g: 255, b: 0 };
	}

	function renderGrid() {
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

		ctx.save();
		ctx.translate(x, y);
		ctx.scale(zoom, zoom);

		const currentGrid = grid();

		if (rule() === "slime") {
			ctx.fillStyle = "#11111b";
			ctx.fillRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT);
			if (offscreenCtx && imageData) {
				const data = imageData.data;
				const gridData = currentGrid.data;
				const { r, g, b } = hexToRgb(slimeConfig().color);

				for (let i = 0; i < gridData.length; i++) {
					const value = gridData[i];
					const pixelIndex = i * 4;

					data[pixelIndex] = r;
					data[pixelIndex + 1] = g;
					data[pixelIndex + 2] = b;
					data[pixelIndex + 3] = value;
				}
				offscreenCtx.putImageData(imageData, 0, 0);

				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(
					offscreenCanvas,
					0,
					0,
					GRID_COLS,
					GRID_ROWS,
					0,
					0,
					TOTAL_WIDTH,
					TOTAL_HEIGHT,
				);
			}
		} else {
			ctx.fillStyle = "#11111b";
			ctx.fillRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT);

			ctx.strokeStyle = "#333344";
			ctx.lineWidth = 2 / zoom;
			ctx.strokeRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT);

			const startCol = Math.floor(Math.max(0, -x / zoom / CELL_SIZE));
			const startRow = Math.floor(Math.max(0, -y / zoom / CELL_SIZE));
			const endCol = Math.min(
				GRID_COLS,
				Math.ceil((width - x) / zoom / CELL_SIZE),
			);
			const endRow = Math.min(
				GRID_ROWS,
				Math.ceil((height - y) / zoom / CELL_SIZE),
			);

			ctx.beginPath();
			ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
			ctx.lineWidth = 0.5 / zoom;

			for (let col = startCol; col <= endCol; col++) {
				const xPos = col * CELL_SIZE;

				ctx.moveTo(xPos, startRow * CELL_SIZE);
				ctx.lineTo(xPos, endRow * CELL_SIZE);
			}

			for (let row = startRow; row <= endRow; row++) {
				const yPos = row * CELL_SIZE;

				ctx.moveTo(startCol * CELL_SIZE, yPos);
				ctx.lineTo(endCol * CELL_SIZE, yPos);
			}
			ctx.stroke();

			for (let row = startRow; row < endRow; row++) {
				for (let col = startCol; col < endCol; col++) {
					const state = getCell(currentGrid, row, col);

					if (state === 1) {
						ctx.fillStyle = "#e0e0e0";
						ctx.fillRect(
							col * CELL_SIZE,
							row * CELL_SIZE,
							CELL_SIZE - 0.5,
							CELL_SIZE - 0.5,
						);
					} else if (state === 2) {
						ctx.fillStyle = "#4a4a5a";
						ctx.fillRect(
							col * CELL_SIZE,
							row * CELL_SIZE,
							CELL_SIZE - 0.5,
							CELL_SIZE - 0.5,
						);
					}
				}
			}
		}

		ctx.restore();
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

import { ceilPowerOfTwo } from "./utils/math";

export const CELL_SIZE = 1;

export const BASE_GRID_COLS = ceilPowerOfTwo(window.innerWidth);
export const BASE_GRID_ROWS = ceilPowerOfTwo(window.innerHeight);

export const MIN_RESOLUTION_SCALE = 0.75;
export const MAX_RESOLUTION_SCALE = 1.0;
export const RESOLUTION_SCALE_STEP = 0.05;

export interface GridDimensions {
	cols: number;
	rows: number;
	colsMask: number;
	rowsMask: number;
	totalWidth: number;
	totalHeight: number;
}

export function getGridDimensions(scale: number): GridDimensions {
	const cols = ceilPowerOfTwo(Math.round(BASE_GRID_COLS * scale));
	const rows = ceilPowerOfTwo(Math.round(BASE_GRID_ROWS * scale));

	return {
		cols,
		rows,
		colsMask: cols - 1,
		rowsMask: rows - 1,
		totalWidth: cols * CELL_SIZE,
		totalHeight: rows * CELL_SIZE,
	};
}

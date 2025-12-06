export interface RGB {
	red: number;
	green: number;
	blue: number;
}

export function hexToRgb(hex: string): RGB {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				red: Number.parseInt(result[1], 16),
				green: Number.parseInt(result[2], 16),
				blue: Number.parseInt(result[3], 16),
			}
		: { red: 0, green: 255, blue: 0 };
}

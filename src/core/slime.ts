import { hexToRgb } from "../utils/color";

export const VALID_SPAWN_PATTERNS = [
	"random",
	"center",
	"circle",
	"multiCircle",
	"spiral",
] as const;

export type SpawnPattern = (typeof VALID_SPAWN_PATTERNS)[number];

export type ColorPresetName =
	| "neon"
	| "ocean"
	| "ember"
	| "toxic"
	| "void"
	| "sunset"
	| "forest"
	| "arctic"
	| "lava"
	| "plasma"
	| "aurora"
	| "fire";

export interface ColorPreset {
	low: string;
	mid: string;
	high: string;
}

export const COLOR_PRESETS: Record<ColorPresetName, ColorPreset> = {
	neon: { low: "#1a0a33", mid: "#ff00b7", high: "#ff66ff" },
	ocean: { low: "#0a2c35", mid: "#00e0ff", high: "#66ffff" },
	ember: { low: "#2a0505", mid: "#ff6b00", high: "#ffaa00" },
	toxic: { low: "#082c14", mid: "#55ff55", high: "#88ff88" },
	void: { low: "#05050a", mid: "#5b1b7d", high: "#ff00aa" },
	sunset: { low: "#240a16", mid: "#ff5a3d", high: "#ff9a73" },
	forest: { low: "#0a1f12", mid: "#2f8f46", high: "#8fcf9a" },
	arctic: { low: "#0a1a2a", mid: "#2c9ad7", high: "#7fd7ff" },
	lava: { low: "#220000", mid: "#d12d00", high: "#ff7a00" },
	plasma: { low: "#0a0a26", mid: "#5a0fd1", high: "#73d7ff" },
	aurora: { low: "#04120f", mid: "#1dbd6f", high: "#5fd2d2" },
	fire: { low: "#2d0b00", mid: "#ff3c00", high: "#ffae00" },
};

export const COLOR_PRESET_NAMES: ColorPresetName[] = [
	"arctic",
	"aurora",
	"ember",
	"fire",
	"forest",
	"lava",
	"neon",
	"ocean",
	"plasma",
	"sunset",
	"toxic",
	"void",
];

export function getColorPreset(presetName: ColorPresetName): ColorPreset {
	return COLOR_PRESETS[presetName] ?? COLOR_PRESETS.neon;
}

export interface ColorPresetFloats {
	low: [number, number, number];
	mid: [number, number, number];
	high: [number, number, number];
}

export function getColorPresetFloats(
	presetName: ColorPresetName,
): ColorPresetFloats {
	const preset = getColorPreset(presetName);
	const lowRgb = hexToRgb(preset.low);
	const midRgb = hexToRgb(preset.mid);
	const highRgb = hexToRgb(preset.high);

	return {
		low: [lowRgb.red / 255, lowRgb.green / 255, lowRgb.blue / 255],
		mid: [midRgb.red / 255, midRgb.green / 255, midRgb.blue / 255],
		high: [highRgb.red / 255, highRgb.green / 255, highRgb.blue / 255],
	};
}

export interface SpeciesConfig {
	sensorAngle: number;
	turnAngle: number;
	sensorDist: number;
	agentSpeed: number;
	depositAmount: number;
	colorPreset: ColorPresetName;
	agentCount: number;
}

export interface SlimeConfig {
	decayRate: number;
	diffuseWeight: number;
	enabledSpawnPatterns: SpawnPattern[];
	agentCount: number;
	species: [SpeciesConfig, SpeciesConfig, SpeciesConfig];
	interactions: number[][];
}

export const DEFAULT_SPECIES_CONFIG: SpeciesConfig = {
	sensorAngle: Math.PI / 4,
	turnAngle: Math.PI / 4,
	sensorDist: 9,
	agentSpeed: 1,
	depositAmount: 50,
	colorPreset: "neon",
	agentCount: 33.33,
};

export const DEFAULT_SLIME_CONFIG: SlimeConfig = {
	decayRate: 2,
	diffuseWeight: 0.1,
	enabledSpawnPatterns: ["center", "circle", "multiCircle", "spiral"],
	agentCount: 5,
	species: [
		{ ...DEFAULT_SPECIES_CONFIG, colorPreset: "neon" },
		{ ...DEFAULT_SPECIES_CONFIG, colorPreset: "fire" },
		{ ...DEFAULT_SPECIES_CONFIG, colorPreset: "ocean" },
	],
	interactions: [
		[1, -0.1, -0.1],
		[-0.1, 1, -0.1],
		[-0.1, -0.1, 1],
	],
};

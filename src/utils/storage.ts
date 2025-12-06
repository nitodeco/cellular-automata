import {
	COLOR_PRESET_NAMES,
	type SlimeConfig,
	type SpawnPattern,
} from "../core/slime";

export interface SimulationSettings {
	speed: number;
	slimeConfig: SlimeConfig;
	useWebGPU: boolean;
}

export const SIMULATION_SETTINGS_KEY = "simulation-settings";

const VALID_SPAWN_PATTERNS: SpawnPattern[] = [
	"random",
	"center",
	"circle",
	"multiCircle",
	"spiral",
];

function isValidColorPreset(
	value: unknown,
): value is SlimeConfig["colorPreset"] {
	return (
		typeof value === "string" &&
		COLOR_PRESET_NAMES.includes(value as SlimeConfig["colorPreset"])
	);
}

function isValidSpawnPattern(value: unknown): value is SpawnPattern {
	return (
		typeof value === "string" &&
		VALID_SPAWN_PATTERNS.includes(value as SpawnPattern)
	);
}

export function isValidSimulationSettings(
	settings: unknown,
): settings is SimulationSettings {
	if (settings === null || typeof settings !== "object") {
		return false;
	}

	const candidate = settings as SimulationSettings;

	return (
		typeof candidate.speed === "number" &&
		typeof candidate.useWebGPU === "boolean" &&
		candidate.slimeConfig !== undefined &&
		typeof candidate.slimeConfig.sensorAngle === "number" &&
		typeof candidate.slimeConfig.turnAngle === "number" &&
		typeof candidate.slimeConfig.sensorDist === "number" &&
		typeof candidate.slimeConfig.decayRate === "number" &&
		typeof candidate.slimeConfig.diffuseWeight === "number" &&
		typeof candidate.slimeConfig.depositAmount === "number" &&
		typeof candidate.slimeConfig.agentSpeed === "number" &&
		typeof candidate.slimeConfig.agentCount === "number" &&
		isValidColorPreset(candidate.slimeConfig.colorPreset) &&
		(candidate.slimeConfig.spawnPattern === undefined ||
			isValidSpawnPattern(candidate.slimeConfig.spawnPattern))
	);
}

export function loadSimulationSettings(): SimulationSettings | null {
	try {
		const stored = localStorage.getItem(SIMULATION_SETTINGS_KEY);
		if (stored === null) {
			return null;
		}

		const parsed = JSON.parse(stored) as SimulationSettings;
		if (
			(parsed as SimulationSettings).slimeConfig &&
			!(parsed as SimulationSettings).slimeConfig.colorPreset
		) {
			(parsed as SimulationSettings).slimeConfig.colorPreset = "neon";
		}

		if (isValidSimulationSettings(parsed)) {
			return parsed;
		}

		return null;
	} catch {
		return null;
	}
}

export function saveSimulationSettings(settings: SimulationSettings): void {
	try {
		localStorage.setItem(SIMULATION_SETTINGS_KEY, JSON.stringify(settings));
	} catch {}
}

export function encodeSimulationSettings(settings: SimulationSettings): string {
	return btoa(JSON.stringify(settings));
}

export function decodeSimulationSettings(
	encoded: string,
): SimulationSettings | null {
	try {
		const parsed = JSON.parse(atob(encoded)) as SimulationSettings;
		if (
			(parsed as SimulationSettings).slimeConfig &&
			!(parsed as SimulationSettings).slimeConfig.colorPreset
		) {
			(parsed as SimulationSettings).slimeConfig.colorPreset = "neon";
		}
		return isValidSimulationSettings(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

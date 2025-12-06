import type { SlimeConfig } from "../core/slime";

export interface SimulationSettings {
	speed: number;
	slimeConfig: SlimeConfig;
	useWebGPU: boolean;
}

export const SIMULATION_SETTINGS_KEY = "simulation-settings";

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
		typeof candidate.slimeConfig.color === "string"
	);
}

export function loadSimulationSettings(): SimulationSettings | null {
	try {
		const stored = localStorage.getItem(SIMULATION_SETTINGS_KEY);
		if (stored === null) {
			return null;
		}

		const parsed = JSON.parse(stored) as SimulationSettings;

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
		return isValidSimulationSettings(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

import type { SlimeConfig } from "../core/slime";

export interface SimulationSettings {
	speed: number;
	slimeConfig: SlimeConfig;
	useWebGPU: boolean;
}

export const SIMULATION_SETTINGS_KEY = "simulation-settings";

export function loadSimulationSettings(): SimulationSettings | null {
	try {
		const stored = localStorage.getItem(SIMULATION_SETTINGS_KEY);
		if (stored === null) {
			return null;
		}

		const parsed = JSON.parse(stored) as SimulationSettings;

		if (
			typeof parsed.speed === "number" &&
			typeof parsed.useWebGPU === "boolean" &&
			parsed.slimeConfig &&
			typeof parsed.slimeConfig.sensorAngle === "number" &&
			typeof parsed.slimeConfig.turnAngle === "number" &&
			typeof parsed.slimeConfig.sensorDist === "number" &&
			typeof parsed.slimeConfig.decayRate === "number" &&
			typeof parsed.slimeConfig.diffuseWeight === "number" &&
			typeof parsed.slimeConfig.depositAmount === "number" &&
			typeof parsed.slimeConfig.agentSpeed === "number" &&
			typeof parsed.slimeConfig.agentCount === "number" &&
			typeof parsed.slimeConfig.color === "string"
		) {
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

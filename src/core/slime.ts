import type { Grid } from "./grid";

export interface SlimeConfig {
	sensorAngle: number;
	turnAngle: number;
	sensorDist: number;
	decayRate: number;
	diffuseWeight: number;
	depositAmount: number;
	agentSpeed: number;
	agentCount: number;
	color: string;
}

export const DEFAULT_SLIME_CONFIG: SlimeConfig = {
	sensorAngle: Math.PI / 4,
	turnAngle: Math.PI / 4,
	sensorDist: 9,
	decayRate: 2,
	diffuseWeight: 0.1,
	depositAmount: 50,
	agentSpeed: 1,
	agentCount: 5,
	color: "#00ff00",
};

export interface Agent {
	x: number;
	y: number;
	angle: number;
}

export function createAgents(
	count: number,
	width: number,
	height: number,
): Agent[] {
	const agents: Agent[] = [];
	for (let i = 0; i < count; i++) {
		agents.push({
			x: Math.random() * width,
			y: Math.random() * height,
			angle: Math.random() * Math.PI * 2,
		});
	}
	return agents;
}

function getSensorValue(
	grid: Grid,
	x: number,
	y: number,
	angle: number,
	sensorDist: number,
): number {
	const sensorX = Math.round(x + Math.cos(angle) * sensorDist);
	const sensorY = Math.round(y + Math.sin(angle) * sensorDist);

	const wrappedX = (sensorX + grid.width) % grid.width;
	const wrappedY = (sensorY + grid.height) % grid.height;

	return grid.data[wrappedY * grid.width + wrappedX];
}

export function stepSlime(
	source: Grid,
	destination: Grid,
	agents: Agent[],
	config: SlimeConfig,
): void {
	const { width, height } = source;
	const sourceData = source.data;
	const destData = destination.data;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = y * width + x;

			let sum = 0;
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					const neighborX = (x + dx + width) % width;
					const neighborY = (y + dy + height) % height;
					sum += sourceData[neighborY * width + neighborX];
				}
			}

			const original = sourceData[index];
			const blurred = sum / 9;
			const diffused =
				original * (1 - config.diffuseWeight) + blurred * config.diffuseWeight;

			const newValue = Math.max(0, diffused - config.decayRate);
			destData[index] = newValue;
		}
	}

	for (let i = 0; i < agents.length; i++) {
		const agent = agents[i];

		const left = getSensorValue(
			source,
			agent.x,
			agent.y,
			agent.angle - config.sensorAngle,
			config.sensorDist,
		);
		const center = getSensorValue(
			source,
			agent.x,
			agent.y,
			agent.angle,
			config.sensorDist,
		);
		const right = getSensorValue(
			source,
			agent.x,
			agent.y,
			agent.angle + config.sensorAngle,
			config.sensorDist,
		);

		if (center > left && center > right) {
		} else if (center < left && center < right) {
			agent.angle += (Math.random() - 0.5) * 2 * config.turnAngle;
		} else if (left > right) {
			agent.angle -= config.turnAngle;
		} else if (right > left) {
			agent.angle += config.turnAngle;
		}

		agent.x += Math.cos(agent.angle) * config.agentSpeed;
		agent.y += Math.sin(agent.angle) * config.agentSpeed;

		if (agent.x < 0) agent.x += width;
		if (agent.x >= width) agent.x -= width;
		if (agent.y < 0) agent.y += height;
		if (agent.y >= height) agent.y -= height;

		const px = Math.floor(agent.x);
		const py = Math.floor(agent.y);
		const index = py * width + px;

		const currentVal = destData[index];
		destData[index] = Math.min(255, currentVal + config.depositAmount);
	}
}

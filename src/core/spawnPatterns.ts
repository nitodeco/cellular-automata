import type { SpawnPattern } from "./slime";

export interface AgentSpawnData {
	xPositions: Float32Array<ArrayBuffer>;
	yPositions: Float32Array<ArrayBuffer>;
	angles: Float32Array<ArrayBuffer>;
}

const ANGLE_NOISE_AMOUNT = Math.PI / 6;
const POSITION_NOISE_AMOUNT = 3;

function addAngleNoise(baseAngle: number): number {
	return baseAngle + (Math.random() - 0.5) * 2 * ANGLE_NOISE_AMOUNT;
}

function addPositionNoise(basePosition: number): number {
	return basePosition + (Math.random() - 0.5) * 2 * POSITION_NOISE_AMOUNT;
}

export function generateAgentPositions(
	pattern: SpawnPattern,
	count: number,
	width: number,
	height: number,
): AgentSpawnData {
	switch (pattern) {
		case "center":
			return spawnCenterPoint(count, width, height);
		case "circle":
			return spawnCircleRing(count, width, height);
		case "multiCircle":
			return spawnMultipleCircles(count, width, height);
		case "spiral":
			return spawnSpiral(count, width, height);
		default:
			return spawnRandom(count, width, height);
	}
}

function spawnRandom(
	count: number,
	width: number,
	height: number,
): AgentSpawnData {
	const xPositions = new Float32Array(count);
	const yPositions = new Float32Array(count);
	const angles = new Float32Array(count);

	for (let index = 0; index < count; index++) {
		xPositions[index] = Math.random() * width;
		yPositions[index] = Math.random() * height;
		angles[index] = Math.random() * Math.PI * 2;
	}

	return { xPositions, yPositions, angles };
}

function spawnCenterPoint(
	count: number,
	width: number,
	height: number,
): AgentSpawnData {
	const xPositions = new Float32Array(count);
	const yPositions = new Float32Array(count);
	const angles = new Float32Array(count);

	const centerX = width / 2;
	const centerY = height / 2;

	for (let index = 0; index < count; index++) {
		xPositions[index] = centerX;
		yPositions[index] = centerY;
		angles[index] = Math.random() * Math.PI * 2;
	}

	return { xPositions, yPositions, angles };
}

function spawnCircleRing(
	count: number,
	width: number,
	height: number,
): AgentSpawnData {
	const xPositions = new Float32Array(count);
	const yPositions = new Float32Array(count);
	const angles = new Float32Array(count);

	const centerX = width / 2;
	const centerY = height / 2;
	const radius = Math.min(width, height) * 0.4;

	for (let index = 0; index < count; index++) {
		const positionAngle = (index / count) * Math.PI * 2;

		const agentX = centerX + Math.cos(positionAngle) * radius;
		const agentY = centerY + Math.sin(positionAngle) * radius;

		xPositions[index] = addPositionNoise(agentX);
		yPositions[index] = addPositionNoise(agentY);

		const facingAngle = positionAngle + Math.PI;
		angles[index] = addAngleNoise(facingAngle);
	}

	return { xPositions, yPositions, angles };
}

function spawnMultipleCircles(
	count: number,
	width: number,
	height: number,
): AgentSpawnData {
	const xPositions = new Float32Array(count);
	const yPositions = new Float32Array(count);
	const angles = new Float32Array(count);

	const centerX = width / 2;
	const centerY = height / 2;
	const minDimension = Math.min(width, height);

	const ringRadii = [
		minDimension * 0.2,
		minDimension * 0.35,
		minDimension * 0.5,
	];

	const ringCount = ringRadii.length;
	const agentsPerRing = Math.floor(count / ringCount);
	const remainder = count % ringCount;

	let agentIndex = 0;

	for (
		let ringIndex = 0;
		ringIndex < ringCount && agentIndex < count;
		ringIndex++
	) {
		const radius = ringRadii[ringIndex];
		const agentsInThisRing = agentsPerRing + (ringIndex < remainder ? 1 : 0);

		for (
			let ringAgentIndex = 0;
			ringAgentIndex < agentsInThisRing && agentIndex < count;
			ringAgentIndex++
		) {
			const positionAngle = (ringAgentIndex / agentsInThisRing) * Math.PI * 2;

			const agentX = centerX + Math.cos(positionAngle) * radius;
			const agentY = centerY + Math.sin(positionAngle) * radius;

			xPositions[agentIndex] = addPositionNoise(agentX);
			yPositions[agentIndex] = addPositionNoise(agentY);

			const facingAngle = positionAngle + Math.PI;
			angles[agentIndex] = addAngleNoise(facingAngle);

			agentIndex++;
		}
	}

	return { xPositions, yPositions, angles };
}

function spawnSpiral(
	count: number,
	width: number,
	height: number,
): AgentSpawnData {
	const xPositions = new Float32Array(count);
	const yPositions = new Float32Array(count);
	const angles = new Float32Array(count);

	const centerX = width / 2;
	const centerY = height / 2;
	const maxRadius = Math.min(width, height) * 0.45;
	const spiralTurns = 5;

	for (let index = 0; index < count; index++) {
		const progress = index / count;
		const spiralAngle = progress * spiralTurns * Math.PI * 2;
		const radius = progress * maxRadius;

		const agentX = centerX + Math.cos(spiralAngle) * radius;
		const agentY = centerY + Math.sin(spiralAngle) * radius;

		xPositions[index] = addPositionNoise(agentX);
		yPositions[index] = addPositionNoise(agentY);

		const facingAngle = spiralAngle + Math.PI;
		angles[index] = addAngleNoise(facingAngle);
	}

	return { xPositions, yPositions, angles };
}

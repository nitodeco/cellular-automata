import type { SlimeConfig, SpawnPattern } from "../slime";
import { generateAgentPositions } from "../spawnPatterns";

export interface GridBuffers {
	bufferA: GPUBuffer;
	bufferB: GPUBuffer;
	width: number;
	height: number;
	textureA: GPUTexture;
	textureB: GPUTexture;
	textureViewA: GPUTextureView;
	textureViewB: GPUTextureView;
}

export interface AgentBuffers {
	positionsX: GPUBuffer;
	positionsY: GPUBuffer;
	angles: GPUBuffer;
	count: number;
}

export interface ConfigUniform {
	buffer: GPUBuffer;
	data: Float32Array;
}

export function createGridBuffers(
	device: GPUDevice,
	width: number,
	height: number,
): GridBuffers {
	const size = width * height * 4;

	const bufferA = device.createBuffer({
		size,
		usage:
			GPUBufferUsage.STORAGE |
			GPUBufferUsage.COPY_DST |
			GPUBufferUsage.COPY_SRC,
		label: "Grid Buffer A",
	});

	const bufferB = device.createBuffer({
		size,
		usage:
			GPUBufferUsage.STORAGE |
			GPUBufferUsage.COPY_DST |
			GPUBufferUsage.COPY_SRC,
		label: "Grid Buffer B",
	});

	const textureDescriptor: GPUTextureDescriptor = {
		size: { width, height },
		format: "r32uint",
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
		label: "Grid Texture",
	};

	const textureA = device.createTexture(textureDescriptor);
	const textureB = device.createTexture(textureDescriptor);

	const textureViewA = textureA.createView();
	const textureViewB = textureB.createView();

	return {
		bufferA,
		bufferB,
		width,
		height,
		textureA,
		textureB,
		textureViewA,
		textureViewB,
	};
}

export function clearGridBuffers(
	device: GPUDevice,
	gridBuffers: GridBuffers,
): void {
	const zeroData = new Uint32Array(gridBuffers.width * gridBuffers.height);
	device.queue.writeBuffer(gridBuffers.bufferA, 0, zeroData);
	device.queue.writeBuffer(gridBuffers.bufferB, 0, zeroData);
}

export function createAgentBuffers(
	device: GPUDevice,
	count: number,
	width: number,
	height: number,
	spawnPattern: SpawnPattern = "random",
): AgentBuffers {
	const size = count * 4;

	const positionsX = device.createBuffer({
		size,
		usage:
			GPUBufferUsage.STORAGE |
			GPUBufferUsage.COPY_DST |
			GPUBufferUsage.COPY_SRC,
		label: "Agent Positions X",
	});

	const positionsY = device.createBuffer({
		size,
		usage:
			GPUBufferUsage.STORAGE |
			GPUBufferUsage.COPY_DST |
			GPUBufferUsage.COPY_SRC,
		label: "Agent Positions Y",
	});

	const anglesBuffer = device.createBuffer({
		size,
		usage:
			GPUBufferUsage.STORAGE |
			GPUBufferUsage.COPY_DST |
			GPUBufferUsage.COPY_SRC,
		label: "Agent Angles",
	});

	const { xPositions, yPositions, angles } = generateAgentPositions(
		spawnPattern,
		count,
		width,
		height,
	);

	device.queue.writeBuffer(positionsX, 0, xPositions);
	device.queue.writeBuffer(positionsY, 0, yPositions);
	device.queue.writeBuffer(anglesBuffer, 0, angles);

	return { positionsX, positionsY, angles: anglesBuffer, count };
}

export function createConfigUniform(device: GPUDevice): ConfigUniform {
	const data = new Float32Array(16);

	const buffer = device.createBuffer({
		size: data.byteLength,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		label: "Config Uniform",
	});

	return { buffer, data };
}

export function updateConfigUniform(
	device: GPUDevice,
	configUniform: ConfigUniform,
	slimeConfig: SlimeConfig,
	width: number,
	height: number,
	frameSeed: number,
	agentCount: number,
): void {
	const data = configUniform.data;
	const dataView = new DataView(data.buffer);

	dataView.setUint32(0, width, true);
	dataView.setUint32(4, height, true);
	dataView.setFloat32(8, slimeConfig.sensorAngle, true);
	dataView.setFloat32(12, slimeConfig.turnAngle, true);
	dataView.setFloat32(16, slimeConfig.sensorDist, true);
	dataView.setFloat32(20, slimeConfig.agentSpeed, true);
	dataView.setFloat32(24, slimeConfig.depositAmount, true);
	dataView.setFloat32(28, frameSeed, true);
	dataView.setFloat32(32, slimeConfig.decayRate, true);
	dataView.setFloat32(36, slimeConfig.diffuseWeight, true);
	dataView.setUint32(40, agentCount, true);

	device.queue.writeBuffer(configUniform.buffer, 0, data);
}

export function createRenderUniform(device: GPUDevice): ConfigUniform {
	const data = new Float32Array(16);

	const buffer = device.createBuffer({
		size: data.byteLength,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		label: "Render Uniform",
	});

	return { buffer, data };
}

export function updateRenderUniform(
	device: GPUDevice,
	renderUniform: ConfigUniform,
	width: number,
	height: number,
	lowColor: [number, number, number],
	midColor: [number, number, number],
	highColor: [number, number, number],
): void {
	const data = renderUniform.data;

	data[0] = width;
	data[1] = height;
	data[2] = 0;
	data[3] = 0;

	data[4] = lowColor[0];
	data[5] = lowColor[1];
	data[6] = lowColor[2];
	data[7] = 0;

	data[8] = midColor[0];
	data[9] = midColor[1];
	data[10] = midColor[2];
	data[11] = 0;

	data[12] = highColor[0];
	data[13] = highColor[1];
	data[14] = highColor[2];
	data[15] = 0;

	device.queue.writeBuffer(renderUniform.buffer, 0, data);
}

export function destroyBuffers(
	gridBuffers: GridBuffers,
	agentBuffers: AgentBuffers,
	configUniform: ConfigUniform,
): void {
	gridBuffers.bufferA.destroy();
	gridBuffers.bufferB.destroy();
	gridBuffers.textureA.destroy();
	gridBuffers.textureB.destroy();
	agentBuffers.positionsX.destroy();
	agentBuffers.positionsY.destroy();
	agentBuffers.angles.destroy();
	configUniform.buffer.destroy();
}

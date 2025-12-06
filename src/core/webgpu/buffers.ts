import type { SlimeConfig } from "../slime";

export interface GridBuffers {
	bufferA: GPUBuffer;
	bufferB: GPUBuffer;
	width: number;
	height: number;
}

export interface AgentBuffers {
	positionsX: GPUBuffer;
	positionsY: GPUBuffer;
	angles: GPUBuffer;
	count: number;
}

export interface ConfigUniform {
	buffer: GPUBuffer;
	data: Float32Array<ArrayBuffer>;
}

export function createGridBuffers(
	device: GPUDevice,
	width: number,
	height: number,
): GridBuffers {
	const size = width * height * 4;

	const bufferA = device.createBuffer({
		size,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		label: "Grid Buffer A",
	});

	const bufferB = device.createBuffer({
		size,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		label: "Grid Buffer B",
	});

	return { bufferA, bufferB, width, height };
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

	const angles = device.createBuffer({
		size,
		usage:
			GPUBufferUsage.STORAGE |
			GPUBufferUsage.COPY_DST |
			GPUBufferUsage.COPY_SRC,
		label: "Agent Angles",
	});

	const xData = new Float32Array(count);
	const yData = new Float32Array(count);
	const angleData = new Float32Array(count);

	for (let index = 0; index < count; index++) {
		xData[index] = Math.random() * width;
		yData[index] = Math.random() * height;
		angleData[index] = Math.random() * Math.PI * 2;
	}

	device.queue.writeBuffer(positionsX, 0, xData);
	device.queue.writeBuffer(positionsY, 0, yData);
	device.queue.writeBuffer(angles, 0, angleData);

	return { positionsX, positionsY, angles, count };
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
	const data = new Float32Array(8);

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
	colorR: number,
	colorG: number,
	colorB: number,
): void {
	const data = renderUniform.data;

	data[0] = width;
	data[1] = height;
	data[2] = colorR;
	data[3] = colorG;
	data[4] = colorB;

	device.queue.writeBuffer(renderUniform.buffer, 0, data);
}

export function destroyBuffers(
	gridBuffers: GridBuffers,
	agentBuffers: AgentBuffers,
	configUniform: ConfigUniform,
): void {
	gridBuffers.bufferA.destroy();
	gridBuffers.bufferB.destroy();
	agentBuffers.positionsX.destroy();
	agentBuffers.positionsY.destroy();
	agentBuffers.angles.destroy();
	configUniform.buffer.destroy();
}

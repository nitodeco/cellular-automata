import agentMoveDepositShader from "./shaders/agentMoveDeposit.wgsl?raw";
import diffuseDecayShader from "./shaders/diffuseDecay.wgsl?raw";
import renderShader from "./shaders/render.wgsl?raw";

export interface ComputePipelines {
	diffuseDecay: GPUComputePipeline;
	agentMoveDeposit: GPUComputePipeline;
}

export interface RenderPipeline {
	pipeline: GPURenderPipeline;
	format: GPUTextureFormat;
}

export function createComputePipelines(device: GPUDevice): ComputePipelines {
	const diffuseDecayModule = device.createShaderModule({
		code: diffuseDecayShader,
		label: "Diffuse Decay Shader",
	});

	const agentMoveDepositModule = device.createShaderModule({
		code: agentMoveDepositShader,
		label: "Agent Move Deposit Shader",
	});

	const diffuseDecay = device.createComputePipeline({
		layout: "auto",
		compute: {
			module: diffuseDecayModule,
			entryPoint: "main",
		},
		label: "Diffuse Decay Pipeline",
	});

	const agentMoveDeposit = device.createComputePipeline({
		layout: "auto",
		compute: {
			module: agentMoveDepositModule,
			entryPoint: "main",
		},
		label: "Agent Move Deposit Pipeline",
	});

	return { diffuseDecay, agentMoveDeposit };
}

export function createRenderPipeline(
	device: GPUDevice,
	format: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat(),
): RenderPipeline {
	const renderModule = device.createShaderModule({
		code: renderShader,
		label: "Render Shader",
	});

	const pipeline = device.createRenderPipeline({
		layout: "auto",
		vertex: {
			module: renderModule,
			entryPoint: "vertexMain",
		},
		fragment: {
			module: renderModule,
			entryPoint: "fragmentMain",
			targets: [{ format }],
		},
		primitive: {
			topology: "triangle-list",
		},
		label: "Render Pipeline",
	});

	return { pipeline, format };
}

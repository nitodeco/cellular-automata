import { createSignal, onCleanup, onMount } from "solid-js";
import { GRID_COLS, GRID_ROWS } from "../constants";
import { createEngine, type Engine } from "../core/engine";
import {
	clearGrid,
	createGrid,
	type Grid,
	randomizeGrid,
	setCell,
} from "../core/grid";
import { getStepFunction, type RuleName } from "../core/rules";
import {
	type Agent,
	createAgents,
	DEFAULT_SLIME_CONFIG,
	type SlimeConfig,
	stepSlime,
} from "../core/slime";

export function useSimulation() {
	const bufferA = createGrid(GRID_ROWS, GRID_COLS);
	const bufferB = createGrid(GRID_ROWS, GRID_COLS);

	const [currentBuffer, setCurrentBuffer] = createSignal<Grid>(bufferA);
	const [rule, setRule] = createSignal<RuleName>("slime");
	const [running, setRunning] = createSignal(false);
	const [speed, setSpeed] = createSignal(100);
	const [slimeConfig, setSlimeConfig] =
		createSignal<SlimeConfig>(DEFAULT_SLIME_CONFIG);

	let engine: Engine | undefined;
	const agentsRef: { current: Agent[] } = { current: [] };

	function initAgents() {
		const config = slimeConfig();
		const count = Math.floor(GRID_ROWS * GRID_COLS * (config.agentCount / 100));
		agentsRef.current = createAgents(count, GRID_COLS, GRID_ROWS);
	}

	function tick() {
		const currentRule = rule();
		const source = currentBuffer();
		const destination = source === bufferA ? bufferB : bufferA;

		if (currentRule === "slime") {
			if (agentsRef.current.length === 0) {
				initAgents();
			}

			stepSlime(source, destination, agentsRef.current, slimeConfig());
		} else {
			const stepFunction = getStepFunction(currentRule);
			stepFunction(source, destination);
		}

		setCurrentBuffer(destination);
	}

	function handlePlayPause() {
		if (!engine) {
			return;
		}

		if (running()) {
			engine.stop();
			setRunning(false);
		} else {
			engine.start();
			setRunning(true);
		}
	}

	function handleStep() {
		tick();
	}

	function handleClear() {
		const current = currentBuffer();
		clearGrid(current);

		const other = current === bufferA ? bufferB : bufferA;
		clearGrid(other);

		if (rule() === "slime") {
			agentsRef.current = [];
		}

		setCurrentBuffer(current === bufferA ? bufferA : bufferB);
	}

	function handleRandom() {
		if (rule() === "slime") {
			initAgents();
			clearGrid(currentBuffer());
			clearGrid(currentBuffer() === bufferA ? bufferB : bufferA);
		} else {
			randomizeGrid(currentBuffer(), 0.3);
		}
		setCurrentBuffer(currentBuffer() === bufferA ? bufferA : bufferB);
	}

	function handleSpeedChange(newSpeed: number) {
		setSpeed(newSpeed);
		engine?.setSpeed(newSpeed);
	}

	function handleRuleChange(newRule: RuleName) {
		setRule(newRule);
		handleClear();
		if (newRule === "slime") {
			initAgents();
		} else {
			handleRandom();
		}
	}

	function handleSlimeConfigChange(
		key: keyof SlimeConfig,
		value: number | string,
	) {
		setSlimeConfig((prev) => ({
			...prev,
			[key]: value,
		}));

		if (key === "agentCount") {
			initAgents();
			clearGrid(currentBuffer());
			clearGrid(currentBuffer() === bufferA ? bufferB : bufferA);
		}
	}

	function setCellAt(row: number, col: number, value: number) {
		setCell(currentBuffer(), row, col, value);
		setCurrentBuffer(currentBuffer() === bufferA ? bufferA : bufferB);
	}

	onMount(() => {
		engine = createEngine(tick);
		if (rule() === "slime") {
			initAgents();
		}
		onCleanup(() => {
			engine?.stop();
		});
	});

	return {
		grid: currentBuffer,
		rule,
		running,
		speed,
		slimeConfig,
		handlePlayPause,
		handleStep,
		handleClear,
		handleRandom,
		handleSpeedChange,
		handleRuleChange,
		handleSlimeConfigChange,
		setCellAt,
	};
}

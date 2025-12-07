import { Show } from "solid-js";
import { Canvas } from "./components/Canvas";
import { ControlDock } from "./components/ControlDock/ControlDock";
import { ShareControl } from "./components/ControlDock/ShareControl";
import { PerformancePanel } from "./components/PerformancePanel";
import { WebGPUWarningDialog } from "./components/WebGPUWarningDialog";
import { useSimulation } from "./hooks/useSimulation";
import { useViewport } from "./hooks/useViewport";

const App = () => {
	const viewportHook = useViewport();
	const simulationHook = useSimulation();

	return (
		<div class="relative w-full h-screen overflow-hidden bg-black">
			<div class="absolute top-4 left-4 z-20 pointer-events-auto">
				<ShareControl getShareUrl={simulationHook.getShareUrl} />
			</div>
			<Canvas
				canvasRef={(el) => {
					simulationHook.setCanvasRef(el);
				}}
				width={viewportHook.canvasSize().width}
				height={viewportHook.canvasSize().height}
			/>

			<ControlDock
				running={simulationHook.running}
				speed={simulationHook.speed}
				slimeConfig={simulationHook.slimeConfig}
				lockedSettings={simulationHook.lockedSettings}
				viewportWidth={viewportHook.canvasSize().width}
				viewportHeight={viewportHook.canvasSize().height}
				isExporting={simulationHook.isExporting}
				isRecording={simulationHook.isRecording}
				onPlayPause={simulationHook.handlePlayPause}
				onClear={simulationHook.handleClear}
				onSpeedChange={simulationHook.handleSpeedChange}
				onSlimeConfigChange={simulationHook.handleSlimeConfigChange}
				onRandomize={simulationHook.handleRandomize}
				onExport={simulationHook.handleExportScreenshot}
				onToggleRecording={simulationHook.handleToggleRecording}
				onToggleLock={simulationHook.handleToggleLock}
				onToggleSpeciesLock={simulationHook.handleToggleSpeciesLock}
			/>

			<PerformancePanel
				fps={simulationHook.fps}
				frameTime={simulationHook.averageFrameTime}
				agentCount={simulationHook.agentCount}
				stepCount={simulationHook.stepCount}
				resolutionScale={simulationHook.resolutionScale}
				gridDimensions={simulationHook.gridDimensions}
			/>

			<Show when={simulationHook.webGPUSupported() === false}>
				<WebGPUWarningDialog />
			</Show>
		</div>
	);
};

export default App;

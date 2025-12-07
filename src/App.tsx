import { Menu } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { Button } from "./components/Button";
import { Canvas } from "./components/Canvas";
import { ControlDock } from "./components/ControlDock/ControlDock";
import { ShareControl } from "./components/ControlDock/ShareControl";
import { FavoriteButton, FavoritesSidebar } from "./components/Favorites";
import { PerformancePanel } from "./components/PerformancePanel";
import { WebGPUWarningDialog } from "./components/WebGPUWarningDialog";
import { useSimulation } from "./hooks/useSimulation";
import { useViewport } from "./hooks/useViewport";
import { addFavorite } from "./utils/storage";

const App = () => {
	const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);

	const viewportHook = useViewport();
	const simulationHook = useSimulation();

	return (
		<div class="relative w-full h-screen overflow-hidden bg-black">
			<div class="absolute top-2 left-2 md:top-4 md:left-4 z-20 pointer-events-auto flex items-center gap-1.5 md:gap-2 max-w-[calc(100vw-8rem)] md:max-w-none">
				<Button
					onClick={() => setIsSidebarOpen(true)}
					class="px-3 py-2 flex items-center justify-center text-gray-200 shrink-0"
					aria-label="Open favorites"
				>
					<Menu class="w-5 h-5" />
				</Button>
				<FavoriteButton
					getSettings={() => ({
						speed: simulationHook.speed(),
						slimeConfig: simulationHook.slimeConfig(),
					})}
					onSave={(name, settings) => {
						addFavorite(name, settings);
						window.dispatchEvent(new Event("favorites-updated"));
					}}
				/>
				<ShareControl getShareUrl={simulationHook.getShareUrl} />
			</div>

			<FavoritesSidebar
				isOpen={isSidebarOpen()}
				onClose={() => setIsSidebarOpen(false)}
				onLoad={(settings) => simulationHook.setSimulationSettings(settings)}
			/>

			<Canvas
				canvasRef={(element: HTMLCanvasElement) => {
					simulationHook.setCanvasRef(element);
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

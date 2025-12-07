import { Heart } from "lucide-solid";
import { createSignal, onCleanup, onMount } from "solid-js";
import { loadFavorites, type SimulationSettings } from "../../utils/storage";
import { Button } from "../Button";
import { Dialog } from "../Dialog";

interface Props {
	getSettings: () => SimulationSettings;
	onSave: (name: string, settings: SimulationSettings) => void;
}

function settingsMatch(
	settings1: SimulationSettings,
	settings2: SimulationSettings,
): boolean {
	return JSON.stringify(settings1) === JSON.stringify(settings2);
}

export const FavoriteButton = (props: Props) => {
	const [saved, setSaved] = createSignal(false);
	const [isDialogOpen, setIsDialogOpen] = createSignal(false);
	const [justSaved, setJustSaved] = createSignal(false);

	function checkIfCurrentSettingsMatchFavorite() {
		if (justSaved()) {
			return;
		}
		const currentSettings = props.getSettings();
		const favorites = loadFavorites();
		const matches = favorites.some((fav) =>
			settingsMatch(fav.settings, currentSettings),
		);
		setSaved(matches);
	}

	function handleSaveClick() {
		setIsDialogOpen(true);
	}

	function handleDialogConfirm(name: string) {
		const settings = props.getSettings();
		props.onSave(name, settings);
		setJustSaved(true);
		setSaved(true);
		setTimeout(() => {
			setJustSaved(false);
			checkIfCurrentSettingsMatchFavorite();
		}, 2000);
	}

	function handleFavoritesUpdated() {
		checkIfCurrentSettingsMatchFavorite();
	}

	onMount(() => {
		checkIfCurrentSettingsMatchFavorite();
		window.addEventListener("favorites-updated", handleFavoritesUpdated);
		window.addEventListener("storage", (e) => {
			if (e.key === "simulation-favorites") {
				checkIfCurrentSettingsMatchFavorite();
			}
		});

		const intervalId = setInterval(() => {
			if (!justSaved()) {
				checkIfCurrentSettingsMatchFavorite();
			}
		}, 500);

		onCleanup(() => {
			clearInterval(intervalId);
		});
	});

	onCleanup(() => {
		window.removeEventListener("favorites-updated", handleFavoritesUpdated);
	});

	return (
		<>
			<Button
				onClick={handleSaveClick}
				class="px-4 py-2 min-w-[50px] md:min-w-[100px] flex items-center justify-center gap-2"
				aria-label="Save as favorite"
			>
				<Heart
					class={`w-5 h-5 transition-colors duration-300 ${
						saved() ? "fill-red-500 text-red-500" : ""
					}`}
				/>
				<span class="hidden md:inline text-sm font-medium">
					{saved() ? "Saved" : "Favorite"}
				</span>
			</Button>
			<Dialog
				variant="input"
				isOpen={isDialogOpen()}
				onClose={() => setIsDialogOpen(false)}
				onConfirm={handleDialogConfirm}
				title="Save Favorite"
				label="Enter a name for this favorite:"
				initialValue="My favorite simulation"
				confirmText="Save"
			/>
		</>
	);
};

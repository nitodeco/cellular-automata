import { Edit2, Play, Trash2, X } from "lucide-solid";
import { createSignal, For, onMount } from "solid-js";
import {
	type Favorite,
	loadFavorites,
	removeFavorite,
	renameFavorite,
	type SimulationSettings,
} from "../../utils/storage";
import { Button } from "../Button";
import { Dialog } from "../Dialog";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onLoad: (settings: SimulationSettings) => void;
}

export const FavoritesSidebar = (props: Props) => {
	const [favorites, setFavorites] = createSignal<Favorite[]>([]);
	const [renameDialogOpen, setRenameDialogOpen] = createSignal(false);
	const [renameTarget, setRenameTarget] = createSignal<{
		id: string;
		currentName: string;
	} | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
	const [deleteTarget, setDeleteTarget] = createSignal<string | null>(null);

	const refreshFavorites = () => {
		setFavorites(loadFavorites());
	};

	onMount(() => {
		refreshFavorites();
		window.addEventListener("storage", (e) => {
			if (e.key === "simulation-favorites") {
				refreshFavorites();
			}
		});
	});

	const handleFavoritesUpdated = () => {
		refreshFavorites();
	};

	onMount(() => {
		window.addEventListener("favorites-updated", handleFavoritesUpdated);
		return () => {
			window.removeEventListener("favorites-updated", handleFavoritesUpdated);
		};
	});

	const handleDelete = (id: string, e: Event) => {
		e.stopPropagation();
		setDeleteTarget(id);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		const targetId = deleteTarget();
		if (targetId) {
			removeFavorite(targetId);
			window.dispatchEvent(new Event("favorites-updated"));
		}
		setDeleteTarget(null);
	};

	const handleRename = (id: string, currentName: string, e: Event) => {
		e.stopPropagation();
		setRenameTarget({ id, currentName });
		setRenameDialogOpen(true);
	};

	const handleRenameConfirm = (newName: string) => {
		const target = renameTarget();
		if (target && newName !== target.currentName) {
			renameFavorite(target.id, newName);
			window.dispatchEvent(new Event("favorites-updated"));
		}
		setRenameTarget(null);
	};

	const handleLoad = (settings: SimulationSettings) => {
		props.onLoad(settings);
		props.onClose();
	};

	return (
		<>
			<button
				type="button"
				class={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 cursor-default ${
					props.isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={props.onClose}
				aria-label="Close sidebar"
			/>

			<div
				class={`fixed top-0 left-0 h-full w-80 glass-panel z-50 transform transition-transform duration-300 ease-out flex flex-col rounded-r-2xl border-l-0 ${
					props.isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{
					background: "rgba(48, 48, 48, 0.5)",
					"backdrop-filter": "blur(32px) saturate(120%)",
					"-webkit-backdrop-filter": "blur(32px) saturate(120%)",
				}}
			>
				<div class="p-4 border-b border-white/10 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-white">Favorites</h2>
					<button
						type="button"
						onClick={props.onClose}
						class="glass-button p-2 rounded-full text-gray-400 hover:text-white"
						aria-label="Close sidebar"
					>
						<X class="w-5 h-5" />
					</button>
				</div>

				<div class="flex-1 overflow-y-auto p-4 space-y-3 preset-list">
					<For
						each={favorites()}
						fallback={
							<div class="text-center text-gray-500 py-8 italic">
								No favorites yet. Save your current settings to see them here!
							</div>
						}
					>
						{(fav) => (
							<div class="glass-panel-subtle p-3 rounded-xl hover:bg-white/5 transition-colors group relative">
								<div class="flex items-start justify-between mb-2">
									<h3
										class="font-medium text-gray-200 truncate pr-2"
										title={fav.name}
									>
										{fav.name}
									</h3>
									<span class="text-xs text-gray-500 whitespace-nowrap">
										{new Date(fav.createdAt).toLocaleDateString()}
									</span>
								</div>

								<div class="flex items-center gap-2 mt-3">
									<Button
										onClick={() => handleLoad(fav.settings)}
										class="flex-1 flex items-center justify-center gap-2 text-xs py-1.5!"
										variant="accent"
									>
										<Play class="w-3 h-3" />
										Load
									</Button>

									<button
										type="button"
										onClick={(e) => handleRename(fav.id, fav.name, e)}
										class="glass-button p-1.5 rounded-lg text-gray-400 hover:text-blue-300"
										title="Rename"
									>
										<Edit2 class="w-4 h-4" />
									</button>

									<button
										type="button"
										onClick={(e) => handleDelete(fav.id, e)}
										class="glass-button p-1.5 rounded-lg text-gray-400 hover:text-red-400"
										title="Delete"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</div>
						)}
					</For>
				</div>
			</div>
			<Dialog
				variant="input"
				isOpen={renameDialogOpen()}
				onClose={() => {
					setRenameDialogOpen(false);
					setRenameTarget(null);
				}}
				onConfirm={handleRenameConfirm}
				title="Rename Favorite"
				label="Enter new name:"
				initialValue={renameTarget()?.currentName ?? ""}
				confirmText="Rename"
			/>
			<Dialog
				variant="confirmation"
				isOpen={deleteDialogOpen()}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeleteTarget(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Delete Favorite"
				message="Are you sure you want to delete this favorite? This action cannot be undone."
				confirmText="Delete"
				confirmVariant="stop"
			/>
		</>
	);
};

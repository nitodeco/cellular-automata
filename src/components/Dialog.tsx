import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "./Button";

interface BaseDialogProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: "default" | "play" | "stop" | "accent";
}

interface InputDialogProps extends BaseDialogProps {
	variant: "input";
	onConfirm: (value: string) => void;
	label: string;
	initialValue?: string;
}

interface ConfirmationDialogProps extends BaseDialogProps {
	variant: "confirmation";
	onConfirm: () => void;
	message: string;
}

type DialogProps = InputDialogProps | ConfirmationDialogProps;

export const Dialog = (props: DialogProps) => {
	const [inputValue, setInputValue] = createSignal(
		props.variant === "input" ? (props.initialValue ?? "") : "",
	);
	let inputRef: HTMLInputElement | undefined;

	createEffect(() => {
		if (props.isOpen && props.variant === "input") {
			setInputValue(props.initialValue ?? "");
			setTimeout(() => {
				inputRef?.focus();
				inputRef?.select();
			}, 0);
		}
	});

	createEffect(() => {
		if (props.variant === "input" && props.initialValue !== undefined) {
			setInputValue(props.initialValue);
		}
	});

	function handleConfirm() {
		if (props.variant === "input") {
			const value = inputValue().trim();
			if (value) {
				props.onConfirm(value);
				props.onClose();
			}
		} else {
			props.onConfirm();
			props.onClose();
		}
	}

	function handleCancel() {
		props.onClose();
	}

	function handleBackdropKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			event.preventDefault();
			handleCancel();
		}
	}

	function handleDialogKeyDown(event: KeyboardEvent) {
		event.stopPropagation();
	}

	function handleKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
			if (event.key === "Escape") {
				event.preventDefault();
				handleCancel();
			} else if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				handleConfirm();
			}
			return;
		}
		if (event.key === "Escape") {
			handleCancel();
		} else if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleConfirm();
		}
	}

	onCleanup(() => {
		document.removeEventListener("keydown", handleKeyDown);
	});

	createEffect(() => {
		if (props.isOpen) {
			document.addEventListener("keydown", handleKeyDown);
		} else {
			document.removeEventListener("keydown", handleKeyDown);
		}
	});

	const dialogId =
		props.variant === "input" ? "dialog-title" : "confirmation-dialog-title";
	const confirmVariant =
		props.confirmVariant ?? (props.variant === "input" ? "accent" : "accent");

	return (
		<Show when={props.isOpen}>
			<Portal>
				<div
					class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default"
					onClick={handleCancel}
					onKeyDown={handleBackdropKeyDown}
					aria-hidden="true"
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby={dialogId}
						class="glass-popover p-6 max-w-sm mx-4 rounded-2xl w-full"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={handleDialogKeyDown}
					>
						<h3 id={dialogId} class="text-lg font-semibold text-white mb-4">
							{props.title}
						</h3>
						{props.variant === "input" ? (
							<label class="block mb-3">
								<span class="text-sm text-gray-300 mb-2 block">
									{props.label}
								</span>
								<input
									ref={inputRef}
									type="text"
									value={inputValue()}
									onInput={(e) => setInputValue(e.currentTarget.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleConfirm();
										} else if (e.key === "Escape") {
											e.preventDefault();
											handleCancel();
										}
									}}
									class="glass-input w-full px-3 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none"
									placeholder="Enter name"
								/>
							</label>
						) : (
							<p class="text-sm text-gray-300 mb-6 leading-relaxed">
								{props.message}
							</p>
						)}
						<div class="flex justify-end gap-3">
							<Button onClick={handleCancel}>
								{props.cancelText ?? "Cancel"}
							</Button>
							<Button onClick={handleConfirm} variant={confirmVariant}>
								{props.confirmText ??
									(props.variant === "input" ? "Save" : "Confirm")}
							</Button>
						</div>
					</div>
				</div>
			</Portal>
		</Show>
	);
};

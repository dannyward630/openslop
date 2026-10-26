import type { BaseEditor } from "slate";
import { HistoryEditor } from "slate-history";

function historyAction(event: KeyboardEvent): "undo" | "redo" | null {
	if (event.altKey || event.isComposing) return null;

	const key = event.key.toLowerCase();
	if ((event.metaKey || event.ctrlKey) && key === "z") {
		return event.shiftKey ? "redo" : "undo";
	}
	if (event.ctrlKey && key === "y") return "redo";
	return null;
}

function isTextEntryTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return target.isContentEditable || target.closest("input, textarea") !== null;
}

export function handleProjectHistoryKeyDown(
	event: KeyboardEvent,
	editor: BaseEditor,
): void {
	if (event.defaultPrevented) return;

	const action = historyAction(event);
	if (!action || isTextEntryTarget(event.target)) return;
	if (!HistoryEditor.isHistoryEditor(editor)) {
		throw new Error("Project editor is missing Slate history");
	}

	event.preventDefault();
	if (action === "undo") HistoryEditor.undo(editor);
	else HistoryEditor.redo(editor);
}

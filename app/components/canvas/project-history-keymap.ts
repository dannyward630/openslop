import { useEffect } from "react";
import isHotkey from "is-hotkey";
import { ReactEditor, useSlateStatic } from "slate-react";
import type { CanvasEditor } from "@/lib/canvas/types";

const isUndoHotkey = isHotkey("mod+z");
const isRedoHotkey = isHotkey(["mod+shift+z", "mod+y"]);
const textInputTypes = new Set([
	"text",
	"search",
	"url",
	"tel",
	"email",
	"password",
	"number",
]);

function isTextEntryTarget(target: EventTarget | null): boolean {
	if (target instanceof HTMLTextAreaElement) return true;
	if (target instanceof HTMLInputElement && textInputTypes.has(target.type)) {
		return true;
	}
	return target instanceof HTMLElement && target.isContentEditable;
}

export function handleProjectHistoryKeyDown(
	event: KeyboardEvent,
	editor: CanvasEditor,
): void {
	if (event.defaultPrevented || event.altKey || event.isComposing) return;

	const isUndo = isUndoHotkey(event);
	const isRedo = isRedoHotkey(event);
	if (!isUndo && !isRedo) return;
	if (isTextEntryTarget(event.target)) return;

	const targetElement =
		event.target instanceof Element
			? event.target
			: event.target instanceof Node
				? event.target.parentElement
				: null;
	if (
		targetElement?.closest("[data-slate-editor]") &&
		ReactEditor.hasEditableTarget(editor, event.target)
	) {
		return;
	}

	event.preventDefault();
	if (isUndo) editor.undo();
	else editor.redo();
}

export function useProjectHistoryHotkeys(): void {
	const editor = useSlateStatic();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) =>
			handleProjectHistoryKeyDown(event, editor);

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [editor]);
}

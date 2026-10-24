// @vitest-environment happy-dom

import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DndContext } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createEditor, type Editor } from "slate";
import { Slate, withReact, type RenderElementProps } from "slate-react";
import { afterEach, expect, it } from "vitest";
import { canvasCollisionDetection } from "../dnd/collision-detection";
import { SortableItem } from "../dnd/sortable-item";
import { useDragAndDrop } from "../dnd/use-drag-and-drop";
import { content, scene } from "./fixtures";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root;
let editor: Editor;
const container = document.body.appendChild(document.createElement("div"));

function SortableScene({ id }: { id: string }) {
	return (
		<SortableItem
			sceneId={id}
			sortableType="scene"
			wrapperClassName={`test-${id}`}
			attributes={{} as RenderElementProps["attributes"]}
			block={scene([content("image", `${id}-image`)], id)}
		>
			{id}
		</SortableItem>
	);
}

function KeyboardSortingProbe() {
	const {
		sceneItems,
		sensors: canvasSensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useDragAndDrop(editor);
	return (
		<DndContext
			sensors={canvasSensors}
			collisionDetection={canvasCollisionDetection}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<SortableContext
				items={sceneItems}
				strategy={verticalListSortingStrategy}
			>
				{sceneItems.map((id) => (
					<SortableScene key={id} id={id} />
				))}
			</SortableContext>
		</DndContext>
	);
}

async function mountCanvas(children: ReactNode) {
	editor = withReact(createEditor());
	root = createRoot(container);
	await act(async () =>
		root.render(
			<Slate
				editor={editor}
				initialValue={[
					scene([content("image", "image-1")], "scene-1"),
					scene([content("image", "image-2")], "scene-2"),
				]}
			>
				{children}
			</Slate>,
		),
	);
}

afterEach(() => act(() => root.unmount()));

it("reorders scenes with the keyboard", async () => {
	await mountCanvas(<KeyboardSortingProbe />);
	const handles = Array.from(
		container.querySelectorAll<HTMLButtonElement>(
			'button[aria-label="Drag to reorder"]',
		),
	);
	handles.forEach((handle, index) => {
		const sortable = handle.parentElement?.parentElement?.parentElement;
		if (!sortable) throw new Error("drag handle is missing its sortable item");
		const top = index * 100;
		Object.defineProperty(sortable, "getBoundingClientRect", {
			value: () => ({
				top,
				bottom: top + 100,
				left: 0,
				right: 300,
				width: 300,
				height: 100,
				x: 0,
				y: top,
				toJSON: () => ({}),
			}),
		});
	});

	const [firstHandle] = handles;
	const instructionId = firstHandle.getAttribute("aria-describedby");
	expect(instructionId).toBeTruthy();
	expect(document.getElementById(instructionId ?? "")?.textContent).toContain(
		"To pick up a draggable item",
	);
	firstHandle.focus();
	const keydown = (code: string, key: string) =>
		new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			code,
			key,
		});

	await act(async () => {
		firstHandle.dispatchEvent(keydown("Space", " "));
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
	expect(document.body.textContent).toContain(
		"Draggable item scene-1 was moved over droppable area scene-1.",
	);
	await act(async () => {
		document.dispatchEvent(keydown("ArrowDown", "ArrowDown"));
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
	await act(async () => {
		document.dispatchEvent(keydown("Space", " "));
		await new Promise((resolve) => setTimeout(resolve, 0));
	});

	expect(editor.children.map((node) => node.id)).toEqual([
		"scene-2",
		"scene-1",
	]);
});

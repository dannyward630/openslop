import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ClipWaveform } from "../clip-waveform";

vi.mock("@/lib/components/use-peaks", () => ({
	usePeaks: () => ({ status: "ready", peaks: [], durationSec: 4 }),
}));

const waveform = (trimStartSec = 0) =>
	renderToStaticMarkup(
		<ClipWaveform
			src="https://audio/line.wav"
			mediaDurationSec={5}
			trimStartSec={trimStartSec}
			pxPerSec={10}
		/>,
	);

describe("ClipWaveform", () => {
	it("leaves timeline-only padding empty after decoded playback", () => {
		expect(waveform()).toContain('style="width:40px;translate:0px"');
	});

	it("keeps the media origin when a trimmed, clamped clip is shown", () => {
		const html = renderToStaticMarkup(
			<div style={{ width: 20, overflow: "hidden" }}>
				<ClipWaveform
					src="https://audio/line.wav"
					mediaDurationSec={5}
					trimStartSec={1}
					pxPerSec={10}
				/>
			</div>,
		);

		expect(html).toContain('style="width:20px;overflow:hidden"');
		expect(html).toContain('style="width:40px;translate:-10px"');
	});
});

import { describe, expect, it } from "vitest";
import {
	frameToRatio,
	ratioToTime,
	toFrames,
	toSeconds,
	timeToRatio,
} from "../frames";

describe("toFrames", () => {
	it("rounds to the nearest whole frame, the way Remotion does", () => {
		expect(toFrames(0.4, 24)).toBe(10);
		expect(toFrames(0.4, 25)).toBe(10);
		expect(toFrames(0.4, 30)).toBe(12);
	});

	it("does not truncate a sub-frame duration away", () => {
		expect(toFrames(1 / 48, 24)).toBe(1);
	});
});

describe("toSeconds", () => {
	it("inverts toFrames for a duration on the grid", () => {
		expect(toSeconds(toFrames(2.5, 24), 24)).toBe(2.5);
	});
});

describe("time ratios", () => {
	it("maps frame times to the same fraction across a long timeline", () => {
		expect(frameToRatio(0, 30, 600)).toBe(0);
		expect(frameToRatio(9000, 30, 600)).toBe(0.5);
		expect(frameToRatio(17999, 30, 600)).toBeCloseTo(17999 / 18000);
	});

	it("uses the full duration for seeking and clamps both ends", () => {
		expect(ratioToTime(0.5, 600)).toBe(300);
		expect(ratioToTime(-1, 600)).toBe(0);
		expect(ratioToTime(2, 600)).toBe(600);
		expect(timeToRatio(300, 600)).toBe(0.5);
		expect(timeToRatio(1, 0)).toBe(0);
	});
});

/**
 * Seconds are the input unit (provider durations, caption timestamps); frames
 * are the timeline unit. Remotion rounds when it converts, so every crossing
 * has to round the same way — otherwise layers positioned absolutely drift
 * away from the ones the renderer positions for us.
 */

export function toFrames(sec: number, fps: number): number {
	return Math.round(sec * fps);
}

export function toSeconds(frames: number, fps: number): number {
	return frames / fps;
}

function clampRatio(ratio: number): number {
	return Math.min(1, Math.max(0, ratio));
}

export function timeToRatio(timeSec: number, totalDurationSec: number): number {
	return totalDurationSec > 0 ? clampRatio(timeSec / totalDurationSec) : 0;
}

export function frameToRatio(
	frame: number,
	fps: number,
	totalDurationSec: number,
): number {
	return timeToRatio(toSeconds(frame, fps), totalDurationSec);
}

export function ratioToTime(ratio: number, totalDurationSec: number): number {
	return totalDurationSec > 0 ? clampRatio(ratio) * totalDurationSec : 0;
}

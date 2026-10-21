"use client";

import { useEffect, useState } from "react";
import { loadPeaks, type DecodedAudio } from "./peaks";

export type PeaksDecode =
	| { status: "loading" }
	| ({ status: "ready" } & DecodedAudio)
	| { status: "failed" };

const LOADING: PeaksDecode = { status: "loading" };

/** The decoded peaks of a source, loading again whenever the source changes. */
export function usePeaks(src: string): PeaksDecode {
	const [decoded, setDecoded] = useState<{ src: string; decode: PeaksDecode }>({
		src,
		decode: LOADING,
	});

	useEffect(() => {
		let cancelled = false;
		loadPeaks(src)
			.then((decoded) => {
				if (!cancelled)
					setDecoded({ src, decode: { status: "ready", ...decoded } });
			})
			.catch((error) => {
				console.error("Failed to decode audio:", error);
				if (!cancelled) setDecoded({ src, decode: { status: "failed" } });
			});
		return () => {
			cancelled = true;
		};
	}, [src]);

	return decoded.src === src ? decoded.decode : LOADING;
}

const audios = new Set<HTMLAudioElement>();

export function registerAudio(a: HTMLAudioElement) {
	audios.add(a);
}

export function unregisterAudio(a: HTMLAudioElement) {
	audios.delete(a);
}

export function stopAllAudio() {
	for (const a of audios) {
		try {
			a.pause();
			a.currentTime = 0;
		} catch (e) {
			// ignore
		}
	}
}

// Set up page lifecycle handlers to stop audio when the user leaves/hides the page
if (typeof window !== "undefined" && typeof document !== "undefined") {
	const stop = () => stopAllAudio();
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) stop();
	});
	window.addEventListener("pagehide", stop);
	window.addEventListener("beforeunload", stop);
}

export default {
	registerAudio,
	unregisterAudio,
	stopAllAudio,
};

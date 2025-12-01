"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Broadcast } from "@/types/tables/Broadcast";
import { createBrowserClient } from "@/utils/supabase/clients/browser";

export default function BroadcastDisplay() {
	const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
	const supabase = createBrowserClient();
	const audioRef = useRef<HTMLAudioElement>(null);
	const pathname = usePathname();

	// Initialize audio context on first user interaction
	useEffect(() => {
		const initAudioContext = () => {
			if (!audioRef.current) return;
			// Just ensure audio element can play when needed
			audioRef.current.muted = false;
		};

		const events = ["click", "touchstart", "keydown"];
		events.forEach((event) => {
			document.addEventListener(event, initAudioContext, { once: true });
		});

		return () => {
			events.forEach((event) => {
				document.removeEventListener(event, initAudioContext);
			});
		};
	}, []);

	// Function to play audio
	const handlePlaySound = useCallback(async () => {
		// Don't play audio on admin broadcast page
		if (pathname?.includes("/admin/broadcast")) {
			console.log("Muting audio on admin broadcast page");
			return;
		}

		if (!audioRef.current) {
			console.warn("Audio ref is not available");
			return;
		}

		console.log("Playing audio");
		audioRef.current.currentTime = 0;
		audioRef.current.volume = 1;

		try {
			await audioRef.current.play();
			console.log("Audio played successfully");
		} catch (err) {
			console.error("Failed to play audio:", err);
		}
	}, [pathname]);

	useEffect(() => {
		// Fetch latest broadcast
		const fetchBroadcast = async () => {
			try {
				const { data, error } = await supabase
					.from("broadcast")
					.select("*")
					.order("created_at", { ascending: false })
					.limit(1)
					.single();

				if (error && error.code !== "PGRST116") {
					console.error("Error fetching broadcast:", error);
					return;
				}

				if (data) {
					// Check if broadcast is still within duration window
					const createdAt = new Date(data.created_at).getTime();
					const now = Date.now();
					const durationMs = (data.duration || 60) * 1000;

					if (now - createdAt < durationMs) {
						setBroadcast(data);
						console.log("Broadcast found on mount:", data);

						// Set timer to clear broadcast
						const timeoutId = setTimeout(() => setBroadcast(null), durationMs - (now - createdAt));
						return () => clearTimeout(timeoutId);
					}
				}
			} catch (err) {
				console.error("Failed to fetch broadcast:", err);
			}
		};

		fetchBroadcast();

		// Subscribe to realtime changes
		console.log("Setting up realtime subscription for broadcasts");
		const subscription = supabase
			.channel("broadcasts")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "broadcast",
				},
				async (payload) => {
					const newBroadcast = payload.new as Broadcast;
					setBroadcast(newBroadcast);
					console.log("New broadcast received via realtime:", newBroadcast);

					// Try to play audio
					await handlePlaySound();

					// Clear after duration
					const durationMs = (newBroadcast.duration || 60) * 1000;
					setTimeout(() => setBroadcast(null), durationMs);
				},
			)
			.subscribe((status) => {
				console.log("Realtime subscription status:", status);
			});

		return () => {
			console.log("Unsubscribing from realtime");
			subscription.unsubscribe();
		};
	}, [supabase, handlePlaySound]);

	if (!broadcast) {
		return (
			<>
				{/* biome-ignore lint: Audio only for notifications */}
				<audio
					ref={audioRef}
					src="/broadcast.wav"
					preload="auto"
					onCanPlayThrough={() => console.log("Audio can play through")}
					onLoadedData={() => console.log("Audio loaded data")}
					onError={(e) => console.error("Audio error:", e.currentTarget.error)}
				/>
			</>
		);
	}

	return (
		<>
			{/* biome-ignore lint: Audio only for notifications */}
			<audio
				ref={audioRef}
				src="/broadcast.wav"
				preload="auto"
				onCanPlayThrough={() => console.log("Audio can play through")}
				onLoadedData={() => console.log("Audio loaded data")}
				onError={(e) => console.error("Audio error:", e.currentTarget.error)}
			/>
			<div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
				<div className="flex justify-center pt-4 px-4 pointer-events-auto">
					<div className="bg-white/80 backdrop-blur-md border border-white/70 text-emerald-950 px-6 py-4 rounded-xl shadow-xl font-semibold text-center max-w-lg">
						{broadcast.text}
					</div>
				</div>
			</div>
		</>
	);
}

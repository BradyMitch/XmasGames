"use client";

import { useEffect, useState } from "react";
import type { InstantWin } from "@/types/tables/InstantWin";
import { createBrowserClient } from "@/utils/supabase/clients/browser";

export const useInstantWinsRealtime = (initialInstantWins: InstantWin["Row"][] = []) => {
	const [instantWins, setInstantWins] = useState<InstantWin["Row"][]>(initialInstantWins);

	useEffect(() => {
		const supabase = createBrowserClient();

		// Subscribe to realtime changes
		const channel = supabase
			.channel("instant_wins")
			.on(
				"postgres_changes",
				{
					event: "*", // Listen to INSERT, UPDATE, DELETE
					schema: "public",
					table: "instant_win",
				},
				(payload) => {
					if (payload.eventType === "UPDATE") {
						// Update the instant win in the list
						setInstantWins((prev) =>
							prev.map((win) =>
								win.id === payload.new.id ? (payload.new as InstantWin["Row"]) : win,
							),
						);
					} else if (payload.eventType === "INSERT") {
						// Add new instant win
						setInstantWins((prev) => [...prev, payload.new as InstantWin["Row"]]);
					} else if (payload.eventType === "DELETE") {
						// Remove deleted instant win
						setInstantWins((prev) => prev.filter((win) => win.id !== payload.old.id));
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	// Filter out won prizes
	const availableInstantWins = instantWins.filter((win) => !win.won);

	return {
		instantWins,
		availableInstantWins,
	};
};

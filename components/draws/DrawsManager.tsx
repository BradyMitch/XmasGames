"use client";

import { useState } from "react";
import { enterDraw } from "@/app/draws/actions";
import type { Draw } from "@/types/tables/Draw";
import { PRIZE_DRAWS } from "@/utils/constants/draws";
import { DrawCard } from "./DrawCard";

type DrawsManagerProps = {
	profileCode: string;
	currentTickets: number;
	userDrawEntries: Draw["Row"][];
};

export function DrawsManager({ profileCode, currentTickets, userDrawEntries }: DrawsManagerProps) {
	const [isEntering, setIsEntering] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getEntriesForDraw = (drawName: string) => {
		return userDrawEntries
			.filter((entry) => entry.name === drawName)
			.reduce((sum, entry) => sum + entry.tickets, 0);
	};

	// Calculate tickets spent on draw entries
	const ticketsSpent = userDrawEntries.reduce((sum, entry) => sum + entry.tickets, 0);
	const availableTickets = currentTickets - ticketsSpent;

	const handleEnterDraw = async (drawId: string, numTickets: number) => {
		setIsEntering(true);
		setError(null);

		const result = await enterDraw(profileCode, drawId, numTickets);

		if (!result.success) {
			setError(result.error || "Failed to enter draw");
		}

		setIsEntering(false);
	};

	return (
		<div className="space-y-6">
			{ticketsSpent > 0 && (
				<div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm">
					<div className="flex items-center justify-between">
						<span className="font-medium text-emerald-900">
							<span className="font-bold">Available:</span> {availableTickets} tickets
						</span>
						<span className="text-emerald-700/70">({ticketsSpent} spent on draws)</span>
					</div>
				</div>
			)}

			{error && (
				<div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
					{error}
				</div>
			)}

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{PRIZE_DRAWS.map((draw) => (
					<DrawCard
						key={draw.id}
						draw={draw}
						currentEntries={getEntriesForDraw(draw.name)}
						availableTickets={availableTickets}
						onEnter={handleEnterDraw}
						isEntering={isEntering}
					/>
				))}
			</div>
		</div>
	);
}

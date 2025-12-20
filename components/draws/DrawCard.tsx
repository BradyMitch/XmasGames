"use client";

import { useState } from "react";
import type { PrizeDraw } from "@/utils/constants/draws";

type DrawCardProps = {
	draw: PrizeDraw;
	currentEntries: number;
	availableTickets: number;
	onEnter: (drawId: string, numTickets: number) => Promise<void>;
	isEntering: boolean;
};

export function DrawCard({
	draw,
	currentEntries,
	availableTickets,
	onEnter,
	isEntering,
}: DrawCardProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [numTickets, setNumTickets] = useState<string>("1");

	const parsedTickets = Number.parseInt(numTickets || "0", 10);

	const handleEnter = async () => {
		if (Number.isNaN(parsedTickets) || parsedTickets < 1 || parsedTickets > availableTickets)
			return;
		setIsSubmitting(true);
		await onEnter(draw.id, parsedTickets);
		setIsSubmitting(false);
	};

	return (
		<div className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-white p-6 shadow-lg shadow-emerald-900/5 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/10">
			<div className="absolute -right-6 -top-6 text-8xl opacity-[0.05] group-hover:opacity-[0.10] transition-opacity">
				{draw.emoji}
			</div>

			<div className="relative">
				<div className="flex items-start justify-between gap-3 mb-4">
					<div className="flex items-center gap-3">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-white border border-emerald-200 shadow-sm text-3xl">
							{draw.emoji}
						</div>
						<div>
							<h3 className="text-lg md:text-xl font-black text-emerald-950 tracking-tight">
								{draw.name}
							</h3>
							<p className="text-xs md:text-sm text-emerald-700/70 font-medium">
								{draw.description}
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/50 px-4 py-3">
						<span className="text-xs font-bold uppercase tracking-wider text-sky-700">
							Your Entries
						</span>
						<span className="text-lg font-black text-sky-950">{currentEntries} 🎫</span>
					</div>

					<div className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3">
						<label htmlFor={`tickets-${draw.id}`} className="block mb-2">
							<span className="text-xs font-bold uppercase tracking-wider text-amber-700">
								Tickets to Enter
							</span>
						</label>
						<input
							id={`tickets-${draw.id}`}
							type="number"
							max={availableTickets}
							value={numTickets}
							onChange={(e) => setNumTickets(e.target.value)}
							className="w-full rounded-xl border-2 border-amber-200 bg-white px-3 py-2 text-center text-xl font-black text-amber-950 focus:border-amber-400 focus:outline-none"
							disabled={isSubmitting || isEntering || availableTickets === 0}
						/>
						<p className="text-[11px] text-amber-700/70 mt-1 text-center">Each ticket = 1 entry</p>
					</div>

					<button
						type="button"
						onClick={handleEnter}
						disabled={
							isSubmitting ||
							isEntering ||
							availableTickets === 0 ||
							Number.isNaN(parsedTickets) ||
							parsedTickets < 1 ||
							parsedTickets > availableTickets
						}
						className="w-full rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-600 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
					>
						{isSubmitting || isEntering
							? "Entering..."
							: availableTickets === 0
								? "No Tickets Available"
								: "Enter Draw"}
					</button>
				</div>
			</div>
		</div>
	);
}

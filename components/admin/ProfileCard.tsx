"use client";

import { useState } from "react";
import type { Profile } from "@/types/tables/Profile";

interface ProfileCardProps {
	profile: Profile["Row"];
	onAddSpins: (profileId: number, spinsToAdd: number) => Promise<void>;
}

export default function ProfileCard({ profile, onAddSpins }: ProfileCardProps) {
	const [spinsInput, setSpinsInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleAddSpins = async () => {
		try {
			setError("");

			const spinsToAdd = parseInt(spinsInput, 10);

			if (Number.isNaN(spinsToAdd) || spinsToAdd <= 0) {
				setError("Enter a positive number");
				return;
			}

			setIsLoading(true);
			await onAddSpins(profile.id, spinsToAdd);
			setSpinsInput("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add spins");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-50 overflow-hidden hover:shadow-xl transition">
			{/* Avatar Header */}
			<div className="bg-gradient-to-r from-emerald-50 to-sky-50 h-20 flex items-center justify-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-2 border-emerald-100 shadow-sm text-4xl">
					{profile.avatar}
				</div>
			</div>

			{/* Content */}
			<div className="p-5">
				{/* Name */}
				<h2 className="text-xl font-extrabold text-emerald-950 mb-3 tracking-tight">
					{profile.name}
				</h2>

				{/* Code */}
				<div className="mb-4 p-3 rounded-xl border border-emerald-100 bg-emerald-50/80">
					<p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-[0.16em] mb-2">
						Code
					</p>
					<div className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-white border border-emerald-200 shadow-sm w-full">
						<p className="text-lg font-mono font-bold text-emerald-900 tracking-[0.2em]">
							{profile.code}
						</p>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 gap-3 mb-5">
					{/* Spins */}
					<div className="relative overflow-hidden rounded-xl border border-red-100 bg-gradient-to-br from-rose-50 via-red-50 to-red-100/80 p-3 shadow-sm">
						<div className="absolute -right-3 -top-3 text-4xl opacity-15">🎰</div>
						<div className="relative">
							<p className="text-[11px] font-semibold text-red-700 uppercase tracking-[0.16em] mb-1">
								Spins
							</p>
							<p className="text-2xl font-extrabold text-red-900">{profile.spins}</p>
						</div>
					</div>

					{/* Tickets */}
					<div className="relative overflow-hidden rounded-xl border border-yellow-100 bg-gradient-to-br from-amber-50 via-yellow-50 to-yellow-100/80 p-3 shadow-sm">
						<div className="absolute -right-3 -top-3 text-4xl opacity-15">🎫</div>
						<div className="relative">
							<p className="text-[11px] font-semibold text-amber-700 uppercase tracking-[0.16em] mb-1">
								Tickets
							</p>
							<p className="text-2xl font-extrabold text-amber-900">{profile.tickets}</p>
						</div>
					</div>
				</div>

				{/* Add Spins */}
				<div className="space-y-2 pt-2 border-t border-emerald-100">
					<label
						htmlFor={`spins-${profile.id}`}
						className="text-xs font-semibold text-emerald-700 uppercase tracking-[0.16em]"
					>
						Add Spins
					</label>
					<div className="flex gap-2">
						<input
							id={`spins-${profile.id}`}
							type="number"
							min="1"
							value={spinsInput}
							onChange={(e) => setSpinsInput(e.target.value)}
							disabled={isLoading}
							placeholder="5"
							className="flex-1 px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 bg-white/70 text-sm font-medium text-emerald-900 disabled:opacity-50"
						/>
						<button
							type="button"
							onClick={handleAddSpins}
							disabled={isLoading || !spinsInput}
							className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
						>
							{isLoading ? "..." : "+"}
						</button>
					</div>
					{error && <p className="text-red-600 text-xs font-medium">{error}</p>}
				</div>
			</div>
		</div>
	);
}

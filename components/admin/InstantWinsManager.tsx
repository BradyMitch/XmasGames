"use client";

import Image from "next/image";
import type { InstantWin } from "@/types/tables/InstantWin";
import type { Profile } from "@/types/tables/Profile";
import { INSTANT_WIN_IMAGES } from "@/utils/constants/instantWins";

type InstantWinsManagerProps = {
	instant_wins: InstantWin["Row"][];
	profiles: Profile["Row"][];
};

export const InstantWinsManager = ({ instant_wins, profiles }: InstantWinsManagerProps) => {
	const profilesMap = profiles.reduce(
		(acc, profile) => {
			acc[profile.id] = profile;
			return acc;
		},
		{} as Record<number, Profile["Row"]>,
	);

	const won = instant_wins.filter((iw) => iw.won);
	const notWon = instant_wins.filter((iw) => !iw.won);

	return (
		<div className="space-y-8">
			{/* Won section */}
			{won.length > 0 && (
				<div>
					<h2 className="mb-4 text-lg font-bold text-emerald-900">✨ Won ({won.length})</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{won.map((iw) => {
							const imageUrl = INSTANT_WIN_IMAGES[iw.id];

							return (
								<div
									key={iw.id}
									className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-md"
								>
									{/* Header with image and name */}
									<div className="flex items-start gap-3 mb-3">
										{imageUrl && (
											<div className="flex-shrink-0 rounded-lg bg-white p-1 overflow-hidden">
												<Image
													src={imageUrl}
													alt={iw.name}
													width={60}
													height={60}
													className="w-14 h-14 object-cover rounded"
												/>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<h3 className="font-bold text-emerald-900 truncate">{iw.name}</h3>
											{iw.value && (
												<p className="text-sm text-emerald-700">${iw.value.toLocaleString()}</p>
											)}
										</div>
									</div>

									{/* Winner info */}
									{iw.won_by_id && profilesMap[iw.won_by_id] && (
										<div className="mt-3 flex items-center gap-2 rounded-lg bg-white/80 p-2">
											<span className="text-lg">{profilesMap[iw.won_by_id].avatar}</span>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold text-emerald-900">
													{profilesMap[iw.won_by_id].name}
												</p>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Not won section */}
			{notWon.length > 0 && (
				<div>
					<h2 className="mb-4 text-lg font-bold text-slate-900">Available ({notWon.length})</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{notWon.map((iw) => {
							const imageUrl = INSTANT_WIN_IMAGES[iw.id];

							return (
								<div
									key={iw.id}
									className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-md"
								>
									{/* Header with image and name */}
									<div className="flex items-start gap-3 mb-3">
										{imageUrl && (
											<div className="flex-shrink-0 rounded-lg bg-white p-1 overflow-hidden">
												<Image
													src={imageUrl}
													alt={iw.name}
													width={60}
													height={60}
													className="w-14 h-14 object-cover rounded"
												/>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<h3 className="font-bold text-slate-900 truncate">{iw.name}</h3>
											{iw.value && (
												<p className="text-sm text-slate-700">${iw.value.toLocaleString()}</p>
											)}
										</div>
									</div>

									{/* Weight info */}
									<p className="mt-2 text-xs font-semibold text-slate-700">Weight: {iw.weight}</p>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{instant_wins.length === 0 && (
				<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center">
					<p className="text-emerald-800">No instant win records yet.</p>
				</div>
			)}
		</div>
	);
};

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Draw } from "@/types/tables/Draw";
import type { InstantWin } from "@/types/tables/InstantWin";
import type { Profile } from "@/types/tables/Profile";
import type { PrizeDraw as PrizeDrawType } from "@/utils/constants/draws";

type Entry = {
	name: string;
	avatar: string;
	tickets: number;
};

type DrawMode = "all-tickets" | "instant-win" | "prize-draw";

type PrizeDrawProps = {
	profiles: Profile["Row"][];
	drawEntries: Draw["Row"][];
	instantWins: InstantWin["Row"][];
	prizeDraws: PrizeDrawType[];
};

export const PrizeDraw = ({ profiles, drawEntries, instantWins, prizeDraws }: PrizeDrawProps) => {
	const [mode, setMode] = useState<DrawMode | null>(null);
	const [selectedInstantWin, setSelectedInstantWin] = useState<string>("");
	const [selectedPrizeDraw, setSelectedPrizeDraw] = useState<string>("");
	const [entries, setEntries] = useState<Entry[]>([]);
	const [isSpinning, setIsSpinning] = useState(false);
	const [winner, setWinner] = useState<Entry | null>(null);
	const [displayEntries, setDisplayEntries] = useState<Entry[]>([]);
	const [rotation, setRotation] = useState(0);
	const rotationRef = useRef(0);
	const animationFrameRef = useRef<number | null>(null);
	const prizeDrawRef = useRef<HTMLAudioElement | null>(null);

	const SPIN_DURATION = 5000; // 5 seconds
	const ITEM_HEIGHT = 60;
	const VISIBLE_ITEMS = 5;
	const MIDDLE_INDEX = Math.floor(VISIBLE_ITEMS / 2);

	// Generate entries based on selected mode
	useEffect(() => {
		if (!mode) return;

		const newEntries: Entry[] = [];

		if (mode === "all-tickets") {
			// Each ticket = 1 entry
			for (const profile of profiles) {
				for (let i = 0; i < profile.tickets; i += 1) {
					newEntries.push({
						name: profile.name,
						avatar: profile.avatar,
						tickets: profile.tickets,
					});
				}
			}
		} else if (mode === "instant-win" && selectedInstantWin) {
			// One entry per profile
			for (const profile of profiles) {
				newEntries.push({
					name: profile.name,
					avatar: profile.avatar,
					tickets: profile.tickets,
				});
			}
		} else if (mode === "prize-draw" && selectedPrizeDraw) {
			// Entries based on draw entries
			const prizeDraw = prizeDraws.find((d) => d.id === selectedPrizeDraw);
			if (prizeDraw) {
				const relevantEntries = drawEntries.filter((entry) => entry.name === prizeDraw.name);

				for (const entry of relevantEntries) {
					const profile = profiles.find((p) => p.id === entry.profile_id);
					if (profile) {
						// Each ticket in the draw entry = 1 entry in the draw
						for (let i = 0; i < entry.tickets; i += 1) {
							newEntries.push({
								name: profile.name,
								avatar: profile.avatar,
								tickets: profile.tickets,
							});
						}
					}
				}
			}
		}

		// Shuffle entries
		const shuffled = newEntries.sort(() => Math.random() - 0.5);
		setEntries(shuffled);
		setDisplayEntries(shuffled);
		setWinner(null);
	}, [mode, selectedInstantWin, selectedPrizeDraw, profiles, drawEntries, prizeDraws]);

	// Create infinite scroll by repeating entries
	const infiniteEntries = [...displayEntries, ...displayEntries, ...displayEntries];

	// biome-ignore lint/correctness/useExhaustiveDependencies: dependencies are managed
	const handleSpin = useCallback(() => {
		if (isSpinning || displayEntries.length === 0) return;

		setIsSpinning(true);
		setWinner(null);

		const startTime = performance.now();
		const totalDistance =
			ITEM_HEIGHT * (displayEntries.length * 8 + Math.floor(Math.random() * displayEntries.length));

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / SPIN_DURATION, 1);

			// Easing: start fast, slow down at end
			const easeProgress = 1 - (1 - progress) ** 3;
			const currentDistance = totalDistance * easeProgress;
			const newRotation = (currentDistance % (ITEM_HEIGHT * displayEntries.length)) / ITEM_HEIGHT;
			rotationRef.current = newRotation;
			setRotation(newRotation);

			if (progress < 1) {
				animationFrameRef.current = requestAnimationFrame(animate);
			} else {
				// Spin complete - winner is the middle item
				const winnerIndex =
					(Math.floor(rotationRef.current) + MIDDLE_INDEX) % displayEntries.length;
				setWinner(displayEntries[winnerIndex]);
				setIsSpinning(false);

				if (prizeDrawRef.current) {
					prizeDrawRef.current.currentTime = 0;
					prizeDrawRef.current.volume = 0.05;
					prizeDrawRef.current.play().catch(() => {
						// Audio play failed silently
					});
				}
			}
		};

		animationFrameRef.current = requestAnimationFrame(animate);
	}, [isSpinning, displayEntries, ITEM_HEIGHT, MIDDLE_INDEX, SPIN_DURATION]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	if (!mode) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500">
				<button
					type="button"
					onClick={() => setMode("all-tickets")}
					className="group relative overflow-hidden rounded-[32px] bg-white p-8 text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl ring-1 ring-emerald-900/5"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 opacity-0 transition-opacity group-hover:opacity-100" />
					<div className="relative z-10 flex flex-col h-full">
						<div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl shadow-inner">
							🎟️
						</div>
						<h3 className="mb-2 text-2xl font-black text-emerald-950">All Tickets</h3>
						<p className="text-sm font-medium text-emerald-900/60 leading-relaxed mb-8">
							Draw a winner from all tickets entered globally. Every ticket counts as one entry.
						</p>
						<div className="mt-auto flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
							Select Mode <span>→</span>
						</div>
					</div>
				</button>

				<button
					type="button"
					onClick={() => setMode("instant-win")}
					className="group relative overflow-hidden rounded-[32px] bg-white p-8 text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl ring-1 ring-amber-900/5"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50 opacity-0 transition-opacity group-hover:opacity-100" />
					<div className="relative z-10 flex flex-col h-full">
						<div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl shadow-inner">
							⚡
						</div>
						<h3 className="mb-2 text-2xl font-black text-amber-950">Instant Win</h3>
						<p className="text-sm font-medium text-amber-900/60 leading-relaxed mb-8">
							Draw a winner for a specific instant win prize. One entry per player.
						</p>
						<div className="mt-auto flex items-center gap-2 text-sm font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
							Select Mode <span>→</span>
						</div>
					</div>
				</button>

				<button
					type="button"
					onClick={() => setMode("prize-draw")}
					className="group relative overflow-hidden rounded-[32px] bg-white p-8 text-left shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl ring-1 ring-blue-900/5"
				>
					<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-0 transition-opacity group-hover:opacity-100" />
					<div className="relative z-10 flex flex-col h-full">
						<div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl shadow-inner">
							🎁
						</div>
						<h3 className="mb-2 text-2xl font-black text-blue-950">Prize Draw</h3>
						<p className="text-sm font-medium text-blue-900/60 leading-relaxed mb-8">
							Draw a winner for a specific prize basket. Entries based on tickets allocated.
						</p>
						<div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
							Select Mode <span>→</span>
						</div>
					</div>
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Audio elements */}
			<audio ref={prizeDrawRef} src="/prize_draw.wav">
				<track kind="captions" label="Prize draw completion sound" />
			</audio>

			{/* Back Button */}
			<div className="w-full flex justify-start">
				<button
					type="button"
					onClick={() => {
						setMode(null);
						setWinner(null);
						setEntries([]);
						setDisplayEntries([]);
					}}
					className="group inline-flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-900/60 hover:bg-white hover:text-emerald-900 hover:shadow-md transition-all"
				>
					<span className="group-hover:-translate-x-0.5 transition-transform">←</span>
					Change Mode
				</button>
			</div>

			{/* Control Panel */}
			<div className="w-full rounded-[32px] border-4 border-emerald-100 bg-white/80 backdrop-blur-xl p-6 shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-900/5">
				{/* Mode Indicator */}
				<div className="mb-6 flex justify-center">
					<div
						className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 ${
							mode === "all-tickets"
								? "bg-emerald-100 text-emerald-800"
								: mode === "instant-win"
									? "bg-amber-100 text-amber-800"
									: "bg-blue-100 text-blue-800"
						}`}
					>
						<span className="text-xl">
							{mode === "all-tickets" ? "🎟️" : mode === "instant-win" ? "⚡" : "🎁"}
						</span>
						<span className="font-black uppercase tracking-wider text-sm">
							{mode === "all-tickets"
								? "All Tickets Draw"
								: mode === "instant-win"
									? "Instant Win Draw"
									: "Prize Basket Draw"}
						</span>
					</div>
				</div>

				{/* Selection Dropdowns */}
				<div className="space-y-4">
					{mode === "instant-win" && (
						<div className="relative group">
							<select
								value={selectedInstantWin}
								onChange={(e) => setSelectedInstantWin(e.target.value)}
								className="w-full appearance-none rounded-2xl border-2 border-amber-200 bg-amber-50/50 px-6 py-4 text-sm font-bold text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all cursor-pointer hover:bg-amber-50"
							>
								<option value="">Select an instant win prize...</option>
								{instantWins.map((iw) => (
									<option key={iw.id} value={iw.id}>
										{iw.name} {iw.value ? `($${iw.value})` : ""}
									</option>
								))}
							</select>
							<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-600">
								▼
							</div>
						</div>
					)}

					{mode === "prize-draw" && (
						<div className="relative group">
							<select
								value={selectedPrizeDraw}
								onChange={(e) => setSelectedPrizeDraw(e.target.value)}
								className="w-full appearance-none rounded-2xl border-2 border-blue-200 bg-blue-50/50 px-6 py-4 text-sm font-bold text-blue-900 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer hover:bg-blue-50"
							>
								<option value="">Select a prize draw...</option>
								{prizeDraws.map((pd) => (
									<option key={pd.id} value={pd.id}>
										{pd.emoji} {pd.name}
									</option>
								))}
							</select>
							<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
								▼
							</div>
						</div>
					)}

					{/* Entry Count Badge */}
					<div className="flex justify-center">
						<div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
							</span>
							<p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
								{entries.length > 0
									? `${entries.length} entr${entries.length !== 1 ? "ies" : "y"} loaded`
									: "Waiting for selection..."}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Wheel Section */}
			{entries.length > 0 && (
				<div className="relative w-full max-w-md mx-auto perspective-1000">
					{/* Machine Frame */}
					<div className="relative rounded-[40px] bg-gradient-to-b from-emerald-900 to-emerald-950 p-4 shadow-2xl shadow-emerald-900/50 ring-4 ring-emerald-800/50">
						{/* Glass Reflection */}
						<div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-30" />

						{/* Pointers */}
						<div className="absolute top-1/2 -left-2 -translate-y-1/2 z-40 drop-shadow-lg">
							<div className="w-0 h-0 border-l-[16px] border-t-[10px] border-b-[10px] border-l-yellow-400 border-t-transparent border-b-transparent filter drop-shadow-md" />
						</div>
						<div className="absolute top-1/2 -right-2 -translate-y-1/2 z-40 drop-shadow-lg">
							<div className="w-0 h-0 border-r-[16px] border-t-[10px] border-b-[10px] border-r-yellow-400 border-t-transparent border-b-transparent filter drop-shadow-md" />
						</div>

						{/* Wheel Window */}
						<div
							className="relative overflow-hidden rounded-[28px] bg-white shadow-inner"
							style={{ height: `${ITEM_HEIGHT * VISIBLE_ITEMS}px` }}
						>
							{/* Inner Shadow Overlay */}
							<div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" />

							{/* Center Highlight Line */}
							<div className="absolute top-1/2 left-0 right-0 h-[60px] -translate-y-1/2 bg-yellow-400/10 border-y-2 border-yellow-400/30 z-10 pointer-events-none backdrop-blur-[1px]" />

							<div
								style={{
									transform: `translateY(${-(rotation * ITEM_HEIGHT)}px)`,
									transition: isSpinning ? "none" : "transform 0.1s linear",
								}}
							>
								{infiniteEntries.map((entry, index) => {
									const distanceFromCenter = index - (rotation + MIDDLE_INDEX);
									const isCenter = Math.abs(distanceFromCenter) < 0.1;
									return (
										<div
											key={`${entry.name}-${index}`}
											className={`flex items-center justify-center border-b border-emerald-100/50 text-center font-bold transition-all ${
												isCenter
													? "bg-emerald-50 text-emerald-950 scale-105"
													: index % 2 === 0
														? "bg-white text-emerald-900/60"
														: "bg-emerald-50/30 text-emerald-900/60"
											}`}
											style={{ height: `${ITEM_HEIGHT}px` }}
										>
											<span className="flex items-center gap-3">
												<span className="text-2xl filter drop-shadow-sm">{entry.avatar}</span>
												<span className="text-base md:text-lg tracking-tight">{entry.name}</span>
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					{/* Spin Button */}
					<div className="mt-8 flex justify-center">
						<button
							type="button"
							onClick={handleSpin}
							disabled={isSpinning}
							className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-12 py-6 transition-all duration-300 ${
								isSpinning
									? "cursor-not-allowed opacity-80"
									: "hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] active:scale-95"
							}`}
						>
							<div
								className={`absolute inset-0 bg-gradient-to-br ${
									isSpinning
										? "from-gray-400 to-gray-500"
										: "from-emerald-500 via-emerald-600 to-emerald-700"
								}`}
							/>
							<div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

							<span className="relative text-2xl font-black uppercase tracking-widest text-white text-shadow-sm">
								{isSpinning ? "Spinning..." : "SPIN NOW"}
							</span>
						</button>
					</div>
				</div>
			)}

			{/* Winner Overlay */}
			{winner &&
				createPortal(
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
						<div className="relative w-full max-w-lg transform overflow-hidden rounded-[40px] bg-white p-1 shadow-2xl animate-in zoom-in-95 duration-300">
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-20 animate-pulse" />

							<div className="relative rounded-[36px] bg-white px-8 py-12 text-center">
								<div className="mb-6 flex justify-center">
									<div className="relative">
										<div className="absolute inset-0 animate-ping rounded-full bg-yellow-200 opacity-75" />
										<span className="relative text-8xl filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300 block">
											{winner.avatar}
										</span>
									</div>
								</div>

								<h2 className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-purple-600">
									We have a winner!
								</h2>
								<h3 className="mb-4 text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
									{winner.name}
								</h3>

								<div className="mb-8 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
									<span>🎟️</span>
									<span>
										{winner.tickets} ticket{winner.tickets !== 1 ? "s" : ""} held
									</span>
								</div>

								<button
									type="button"
									onClick={() => {
										setWinner(null);
										const shuffled = [...displayEntries].sort(() => Math.random() - 0.5);
										setDisplayEntries(shuffled);
										rotationRef.current = 0;
										setRotation(0);
									}}
									className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]"
								>
									Close & Reset
								</button>
							</div>
						</div>

						{/* Confetti effect could go here */}
					</div>,
					document.body,
				)}

			{/* Stats Footer */}
			{entries.length > 0 && (
				<div className="grid grid-cols-2 gap-4 w-full max-w-md">
					<div className="rounded-2xl border border-emerald-100 bg-white/60 px-4 py-3 text-center backdrop-blur-sm">
						<p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 mb-1">
							Total Entries
						</p>
						<p className="text-2xl font-black text-emerald-900">{entries.length}</p>
					</div>
					<div className="rounded-2xl border border-purple-100 bg-white/60 px-4 py-3 text-center backdrop-blur-sm">
						<p className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70 mb-1">
							Players
						</p>
						<p className="text-2xl font-black text-purple-900">
							{Array.from(new Set(displayEntries.map((e) => e.name))).length}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

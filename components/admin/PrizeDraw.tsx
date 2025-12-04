"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Entry = {
	name: string;
	avatar: string;
	tickets: number;
};

type PrizeDrawProps = {
	entries: Entry[];
};

export const PrizeDraw = ({ entries }: PrizeDrawProps) => {
	const [isSpinning, setIsSpinning] = useState(false);
	const [winner, setWinner] = useState<(typeof entries)[0] | null>(null);
	const [displayEntries, setDisplayEntries] = useState(() => {
		const shuffled = [...entries].sort(() => Math.random() - 0.5);
		return shuffled;
	});
	const [rotation, setRotation] = useState(0);
	const rotationRef = useRef(0);
	const animationFrameRef = useRef<number | null>(null);
	const prizeDrawRef = useRef<HTMLAudioElement | null>(null);

	const SPIN_DURATION = 5000; // 5 seconds
	const ITEM_HEIGHT = 60;
	const VISIBLE_ITEMS = 5;
	const TOTAL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
	const MIDDLE_INDEX = Math.floor(VISIBLE_ITEMS / 2); // Index 2 for 5 items

	// Create infinite scroll by repeating entries
	const infiniteEntries = [...displayEntries, ...displayEntries, ...displayEntries];

	// Get unique entries for shuffling
	const uniqueEntries = Array.from(new Map(displayEntries.map((e) => [e.name, e])).values());

	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
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
				// Spin complete - winner is the middle item (index 2 in visible window)
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
	}, [isSpinning, displayEntries]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	return (
		<div className="flex flex-col items-center gap-6">
			{/* Audio elements */}
			<audio ref={prizeDrawRef} src="/prize_draw.wav">
				<track kind="captions" label="Prize draw completion sound" />
			</audio>

			{/* Wheel Container */}
			<div className="relative w-full max-w-md">
				{/* Left Pointer - points right */}
				<div className="absolute top-1/2 left-0 -translate-y-1/2 z-20 flex items-center">
					<div className="w-0 h-0 border-l-12 border-t-8 border-b-8 border-l-emerald-600 border-t-transparent border-b-transparent" />
				</div>

				{/* Right Pointer - points left */}
				<div className="absolute top-1/2 right-0 -translate-y-1/2 z-20 flex items-center">
					<div className="w-0 h-0 border-r-12 border-t-8 border-b-8 border-r-emerald-600 border-t-transparent border-b-transparent" />
				</div>

				{/* Wheel */}
				<div
					className="overflow-hidden rounded-2xl border-4 border-emerald-800/30 bg-white shadow-lg"
					style={{ height: `${TOTAL_HEIGHT}px` }}
				>
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
									className={`flex items-center justify-center border-b border-emerald-200/50 text-center font-semibold transition-all ${
										isCenter
											? "bg-emerald-200 text-emerald-950 ring-2 ring-emerald-400"
											: index % 3 === 0
												? "bg-emerald-50 text-emerald-900"
												: index % 3 === 1
													? "bg-emerald-100 text-emerald-900"
													: "bg-emerald-50 text-emerald-900"
									}`}
									style={{ height: `${ITEM_HEIGHT}px` }}
								>
									<span className="flex items-center gap-2">
										<span className="text-lg">{entry.avatar}</span>
										<span className="text-sm md:text-base">{entry.name}</span>
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Draw button */}
			<button
				type="button"
				onClick={handleSpin}
				disabled={isSpinning}
				className={
					"px-8 py-4 rounded-2xl font-bold text-lg transition-all " +
					"border-2 " +
					(isSpinning
						? "border-emerald-300 bg-emerald-200 text-emerald-600 cursor-not-allowed"
						: "border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-xl") +
					" shadow-md"
				}
			>
				{isSpinning ? "Spinning..." : "Draw Winner"}
			</button>

			{/* Winner display */}
			{winner && (
				<div
					className={
						"w-full max-w-sm rounded-3xl border-2 border-purple-300 " +
						"bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 " +
						"p-6 text-center shadow-xl animate-pulse"
					}
				>
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-700 mb-2">
						🎉 Winner! 🎉
					</p>
					<div className="flex items-center justify-center gap-3 mb-3">
						<span className="text-5xl">{winner.avatar}</span>
						<div>
							<p className="text-3xl font-extrabold text-purple-900">{winner.name}</p>
							<p className="text-sm text-purple-700">
								{winner.tickets} ticket{winner.tickets !== 1 ? "s" : ""}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => {
							setWinner(null);
							// Shuffle entries
							const shuffled = [...displayEntries].sort(() => Math.random() - 0.5);
							setDisplayEntries(shuffled);
							rotationRef.current = 0;
						}}
						className={
							"mt-4 w-full px-4 py-2 rounded-lg font-semibold " +
							"bg-purple-600 text-white hover:bg-purple-700 " +
							"transition-colors"
						}
					>
						Draw Again
					</button>
				</div>
			)}

			{/* Stats */}
			<div className="w-full max-w-sm grid grid-cols-2 gap-3">
				<div
					className={
						"rounded-2xl border border-emerald-100 bg-emerald-50/80 " + "px-4 py-3 text-center"
					}
				>
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 mb-1">
						Total Entries
					</p>
					<p className="text-2xl font-extrabold text-emerald-900">{entries.length}</p>
				</div>
				<div
					className={
						"rounded-2xl border border-purple-100 bg-purple-50/80 " + "px-4 py-3 text-center"
					}
				>
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700 mb-1">
						Unique Players
					</p>
					<p className="text-2xl font-extrabold text-purple-900">{uniqueEntries.length}</p>
				</div>
			</div>
		</div>
	);
};

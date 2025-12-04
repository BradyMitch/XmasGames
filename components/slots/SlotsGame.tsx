/** biome-ignore-all lint/suspicious/noArrayIndexKey: Uses index for stable grid mapping */
"use client";

import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, useCallback, useMemo } from "react";
import { markInstantWinAsWon } from "@/app/slots/actions";
import { useInstantWinsRealtime } from "@/hooks/useInstantWinsRealtime";
import type { InstantWin } from "@/types/tables/InstantWin";
import { INSTANT_WIN_IMAGES } from "@/utils/constants/instantWins";
import {
	SLOT_BONUS_DEFINITIONS,
	SLOT_REEL_COUNT,
	SLOT_ROW_COUNT,
	SLOT_SYMBOL_MULTIPLIERS,
	SLOT_SYMBOL_WEIGHTS,
	SLOT_VOLUME_RANGE,
} from "@/utils/constants/slots";
import { InstantWinModal } from "./InstantWinModal";
import { useSlotsGame } from "./useSlotsGame";

type SlotsGameProps = {
	initialSpins: number;
	initialTickets: number;
	profileId: number;
	profileName: string;
	instantWins: InstantWin["Row"][];
	onSpinCompleted?: (spinCount: number) => Promise<{ success: boolean; error?: string }>;
	onTicketsEarned?: (ticketCount: number) => Promise<{ success: boolean; error?: string }>;
};

const DEFAULT_SYMBOL = "🎄";
const joinClasses = (...classes: string[]) => classes.join(" ");

export const SlotsGame = ({
	initialSpins,
	initialTickets,
	profileId,
	profileName,
	instantWins,
	onSpinCompleted,
	onTicketsEarned,
}: SlotsGameProps) => {
	const { availableInstantWins } = useInstantWinsRealtime(instantWins);

	const handleInstantWinWon = useCallback(
		async (instantWin: InstantWin["Row"]) => {
			try {
				await markInstantWinAsWon(instantWin.id, profileId, profileName);
			} catch (error) {
				console.error("Failed to mark instant win as won:", error);
			}
		},
		[profileId, profileName],
	);

	const slots = useSlotsGame({
		initialSpins,
		onSpinCompleted,
		onTicketsEarned,
		instantWins: availableInstantWins,
		onInstantWinWon: handleInstantWinWon,
	});

	const activeBonusDefinition = useMemo(
		() =>
			SLOT_BONUS_DEFINITIONS.find((definition) => definition.symbol === slots.activeBonusSymbol) ??
			null,
		[slots.activeBonusSymbol],
	);

	const triggeredBonusDefinition = useMemo(
		() =>
			SLOT_BONUS_DEFINITIONS.find(
				(definition) => definition.symbol === slots.lastWin.bonusTriggered,
			) ?? null,
		[slots.lastWin.bonusTriggered],
	);

	const symbolWeightMap = useMemo(() => {
		const map = new Map<string, number>();
		for (const item of SLOT_SYMBOL_WEIGHTS) {
			map.set(item.symbol, item.weight);
		}
		return map;
	}, []);

	const symbolLegend = useMemo(
		() =>
			Object.entries(SLOT_SYMBOL_MULTIPLIERS)
				.sort(([, multB], [, multA]) => multB - multA)
				.map(([symbol, multiplier]) => ({
					symbol,
					multiplier,
					weight: symbolWeightMap.get(symbol) ?? null,
				})),
		[symbolWeightMap],
	);

	const gridSymbols = (() => {
		const base = slots.symbolsRef.current;
		if (base.length === 0) {
			return Array.from({ length: SLOT_ROW_COUNT }, () =>
				Array.from({ length: SLOT_REEL_COUNT }, () => DEFAULT_SYMBOL),
			);
		}
		return Array.from({ length: SLOT_ROW_COUNT }, (_, rowIndex) =>
			Array.from({ length: SLOT_REEL_COUNT }, (_, reelIndex) => {
				// Check if this cell is sticky - if so, show the sticky symbol
				const cellId = `cell-${reelIndex}-${rowIndex}`;
				if (slots.stickyCells.has(cellId)) {
					return slots.stickySymbols.get(cellId) ?? DEFAULT_SYMBOL;
				}
				const symbolIndex = (slots.reelPositions[reelIndex] + rowIndex) % base.length;
				return base[symbolIndex] ?? DEFAULT_SYMBOL;
			}),
		);
	})();

	const totalTickets = initialTickets + slots.ticketsEarned;
	const volumePercent = Math.round(slots.volume * 100);
	const sliderMin = SLOT_VOLUME_RANGE.min * 100;
	const sliderMax = SLOT_VOLUME_RANGE.max * 100;
	const sliderStep = SLOT_VOLUME_RANGE.step * 100;
	const hasWinningRows = slots.lastWin.rows.length > 0;
	const totalTicketsText = hasWinningRows ? slots.lastWin.totalTickets : "—";
	const spinLabel = slots.showActivateBonus
		? "Activate Bonus"
		: slots.bonusRoundsLeft > 0
			? "Bonus Spin"
			: slots.isSpinning
				? "Spinning..."
				: "Spin";

	const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
		const parsed = Number.parseInt(event.currentTarget.value, 10);
		if (Number.isNaN(parsed)) {
			return;
		}
		slots.setVolume(parsed / 100);
	};

	const renderCell = (symbol: string, reelIndex: number, rowIndex: number) => {
		const cellId = `cell-${reelIndex}-${rowIndex}`;
		const cellClasses = [
			"relative flex h-20 md:h-24 items-center justify-center rounded-2xl border",
			"bg-emerald-950/80 border-emerald-800/70 text-3xl md:text-4xl text-emerald-50",
			"transition-all duration-300",
		];
		const isWinning = slots.winningCells.has(cellId);
		const isBonus = slots.bonusCells.has(cellId);
		const isSticky = slots.stickyCells.has(cellId);
		const isBonusReel = slots.bonusReels[reelIndex];
		const isStopped = slots.stoppedReels[reelIndex];
		const isBonusTriggered = isBonus && slots.lastWin.bonusTriggered === symbol;
		const isInstantWin = symbol === "🎁" && slots.instantWonData;

		if (slots.isSpinning && !isStopped) {
			cellClasses.push("animate-pulse");
		}
		if (isSticky) {
			cellClasses.push("bg-white/85 border-transparent shadow-[0_0_32px_rgba(165,243,252,0.45)]");
		}
		if (isBonusReel) {
			cellClasses.push("shadow-[0_0_22px_rgba(168,85,247,0.35)]");
		}
		if (isWinning) {
			cellClasses.push(
				"bg-yellow-200/20 border-yellow-300 text-yellow-50 shadow-[0_12px_30px_rgba(234,179,8,0.35)]",
			);
		} else if (isBonus) {
			cellClasses.push(
				"bg-purple-500/25 border-purple-300 text-purple-50 shadow-[0_0_24px_rgba(168,85,247,0.4)]",
			);
		}

		return (
			<div key={cellId} className={cellClasses.join(" ")}>
				{isSticky && (
					<>
						<div className="pointer-events-none absolute -inset-[3px] rounded-[1.45rem] bg-gradient-to-br from-cyan-200/55 via-transparent to-cyan-500/35 blur-[2px]" />
						<div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-100/75 shadow-[inset_0_0_24px_rgba(165,243,252,0.45)]" />
						<div className="pointer-events-none absolute inset-[3px] rounded-[1.2rem] border border-white/65" />
						<div className="pointer-events-none absolute inset-[6px] rounded-2xl bg-gradient-to-br from-white/45 via-white/15 to-transparent" />
						<div className="pointer-events-none absolute -left-2 top-6 h-5 w-5 rotate-45 rounded-sm bg-gradient-to-br from-white/90 via-cyan-100/70 to-transparent shadow-[0_0_14px_rgba(165,243,252,0.6)]" />
						<div className="pointer-events-none absolute -right-2 top-8 h-5 w-5 rotate-45 rounded-sm bg-gradient-to-br from-white/95 via-cyan-200/70 to-transparent shadow-[0_0_14px_rgba(165,243,252,0.6)]" />
						<div className="pointer-events-none absolute left-8 -top-2 h-5 w-5 rotate-45 rounded-sm bg-gradient-to-br from-white/90 via-cyan-100/70 to-transparent shadow-[0_0_14px_rgba(165,243,252,0.6)]" />
						<div className="pointer-events-none absolute right-6 -bottom-2 h-5 w-5 rotate-45 rounded-sm bg-gradient-to-br from-white/95 via-cyan-200/75 to-transparent shadow-[0_0_14px_rgba(165,243,252,0.6)]" />
					</>
				)}
				{slots.instantWonData && isInstantWin && INSTANT_WIN_IMAGES[slots.instantWonData.id] ? (
					<Image
						src={INSTANT_WIN_IMAGES[slots.instantWonData.id]}
						alt={slots.instantWonData.name}
						width={96}
						height={96}
						className="h-14 w-14 md:h-20 md:w-20 rounded-xl object-cover"
					/>
				) : (
					<span className="relative z-10">{symbol}</span>
				)}
				{!slots.isSpinning && isWinning && (
					<span className="absolute right-2 top-2 text-[10px] font-semibold uppercase text-yellow-200">
						Win
					</span>
				)}
				{!slots.isSpinning && !isWinning && isBonus && isBonusTriggered && (
					<span className="absolute right-2 top-2 text-[10px] font-semibold uppercase text-purple-100">
						Bonus
					</span>
				)}
			</div>
		);
	};

	return (
		<div className={joinClasses("w-full", "max-w-6xl")}>
			<div
				className={joinClasses(
					"rounded-[40px] border border-white/50 bg-white/90 px-6 py-8 shadow-2xl",
					"backdrop-blur-xl md:px-10 md:py-10 ring-1 ring-emerald-900/5 relative overflow-hidden",
				)}
			>
				{/* Decorative background gradient inside card */}
				<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

				<header className={joinClasses("mb-8", "flex flex-col items-center gap-4 relative")}>
					<div
						className={joinClasses(
							"inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50",
							"px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700 shadow-sm",
						)}
					>
						<span className="text-[10px] animate-pulse">●</span>
						Christmas Slots
					</div>
					<h1
						className={joinClasses(
							"text-center text-3xl font-black uppercase tracking-tight text-emerald-950",
							"md:text-4xl lg:text-5xl",
						)}
					>
						Slot Machine
					</h1>
					<p className="max-w-xl text-center text-sm font-medium text-emerald-800/70 leading-relaxed">
						Spin to collect tickets, trigger holiday bonuses, and chase the festive jackpot.
					</p>
				</header>

				<div className="flex flex-col gap-8 md:flex-row md:items-start relative">
					<div className="flex min-w-0 flex-1 flex-col gap-6">
						<section
							className={joinClasses(
								"rounded-[32px] border border-emerald-900/10 bg-emerald-950 p-6",
								"shadow-2xl shadow-emerald-900/20 relative overflow-hidden",
							)}
						>
							{/* Subtle texture for the machine background */}
							<div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

							<div className="mb-5 flex flex-wrap items-center justify-between gap-3 relative">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60 mb-1">
										Current spin
									</p>
									<p className="text-sm font-bold text-emerald-100">
										Spins left: <span className="text-white text-lg">{slots.spinsLeft}</span>
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									{slots.activeWeightedSymbol && (
										<span
											className={joinClasses(
												"inline-flex items-center gap-2 rounded-full border border-amber-400/30",
												"bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200 backdrop-blur-sm",
											)}
										>
											<span className="md:inline hidden uppercase tracking-wider text-[10px]">
												More
											</span>
											<span className="md:hidden">+</span>
											<span className="text-lg">{slots.activeWeightedSymbol}</span>
										</span>
									)}
									{slots.randomRemovalSymbol && (
										<span
											className={joinClasses(
												"inline-flex items-center gap-2 rounded-full border border-red-400/30",
												"bg-red-400/10 px-3 py-1 text-xs font-bold text-red-200 backdrop-blur-sm",
											)}
										>
											<span className="md:inline hidden uppercase tracking-wider text-[10px]">
												Removed
											</span>
											<span className="md:hidden">−</span>
											<span className="text-lg">{slots.randomRemovalSymbol}</span>
										</span>
									)}
								</div>
							</div>
							<div
								className={joinClasses("grid gap-2 md:gap-3 relative")}
								style={{ gridTemplateColumns: `repeat(${SLOT_REEL_COUNT}, minmax(0, 1fr))` }}
							>
								{gridSymbols.map((rowSymbols, rowIndex) => (
									<div key={`row-${rowIndex}`} className="contents">
										{rowSymbols.map((symbol, reelIndex) => renderCell(symbol, reelIndex, rowIndex))}
									</div>
								))}
							</div>
						</section>

						<button
							type="button"
							onClick={slots.handleSpin}
							className={joinClasses(
								"md:hidden inline-flex w-full items-center justify-center rounded-2xl border border-emerald-400/30",
								"bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-4 text-base font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-900/20",
								"transition-all hover:from-emerald-500 hover:to-emerald-400 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0",
								"disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none",
							)}
							disabled={
								slots.isSpinning ||
								(!slots.canSpin && !slots.showActivateBonus) ||
								slots.showInstantWinModal ||
								slots.instantWonData !== null
							}
						>
							{spinLabel}
						</button>

						{(slots.bonusRoundsLeft > 0 || slots.bonusJustEnded) && (
							<section
								className={joinClasses(
									"rounded-[24px] border-2 border-yellow-300 bg-yellow-50/95 px-6 py-5",
									"text-yellow-900 shadow-lg shadow-yellow-900/5",
								)}
							>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-3">
											<span className="text-3xl filter drop-shadow-sm">
												{activeBonusDefinition?.symbol ?? "🎯"}
											</span>
											<div>
												<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-700">
													Bonus round active
												</p>
												<p className="text-sm font-bold">
													{activeBonusDefinition?.label ?? "Holiday Bonus"}
												</p>
											</div>
										</div>
										<div className="flex flex-col items-end text-yellow-900">
											<span className="text-3xl font-black leading-none">
												{slots.bonusRoundsLeft}
											</span>
											<span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
												spins left
											</span>
										</div>
									</div>
									<div
										className={joinClasses(
											"flex items-center justify-between rounded-xl border border-yellow-200",
											"bg-white/50 px-4 py-3",
										)}
									>
										<span className="text-xs font-bold uppercase tracking-wider text-yellow-800/70">
											Bonus tickets earned
										</span>
										<span className="text-xl font-black text-yellow-600">
											{slots.bonusTicketsEarned}
										</span>
									</div>
								</div>
							</section>
						)}

						<section
							className={joinClasses(
								"rounded-[24px] border border-emerald-100 bg-white/60 backdrop-blur-sm px-6 py-6",
								"text-emerald-900 shadow-sm",
							)}
						>
							<header className="mb-5 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="text-2xl">{hasWinningRows ? "🎉" : "✨"}</span>
									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/80 mb-0.5">
											Last spin summary
										</p>
										<p className="text-xs font-medium text-emerald-800/50">
											Tickets and bonuses from the previous spin
										</p>
									</div>
								</div>
								<div className="text-lg font-bold text-emerald-600">
									{hasWinningRows ? `${totalTicketsText} tickets` : "No tickets"}
								</div>
							</header>
							<div className="space-y-2 text-sm">
								{hasWinningRows ? (
									slots.lastWin.rows.map((row, index) => (
										<div
											key={`win-row-${row.symbol}-${index}`}
											className={joinClasses(
												"flex items-center justify-between rounded-xl border border-emerald-100/50",
												"bg-white/40 px-4 py-3",
											)}
										>
											<span className="text-xl">{row.symbol}</span>
											<span className="font-bold text-emerald-700">
												{row.multiplier * slots.lastWin.bonusMultiplier} tickets
											</span>
										</div>
									))
								) : (
									<p
										className={joinClasses(
											"rounded-xl border border-emerald-100/50 bg-white/40",
											"px-4 py-4 text-center text-emerald-800/40 font-medium italic",
										)}
									>
										No winning rows yet—spin to try again!
									</p>
								)}
							</div>
							{triggeredBonusDefinition && (
								<div
									className={joinClasses(
										"mt-4 flex items-center justify-between rounded-xl border border-purple-200",
										"bg-purple-50/80 px-4 py-3 text-sm text-purple-900",
									)}
								>
									<span className="flex items-center gap-2 font-bold">
										<span className="text-xl">{triggeredBonusDefinition.symbol}</span>
										{triggeredBonusDefinition.label}
									</span>
									<span className="text-[10px] font-bold uppercase tracking-[0.16em] bg-purple-100 text-purple-700 px-2 py-1 rounded">
										Bonus ready
									</span>
								</div>
							)}
						</section>

						<section
							className={joinClasses(
								"rounded-[24px] border border-emerald-100 bg-white/60 backdrop-blur-sm px-6 py-6",
								"text-emerald-900 shadow-sm",
							)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="text-2xl">🎫</span>
									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/80 mb-0.5">
											Total tickets
										</p>
										<p className="text-xs font-medium text-emerald-800/50">
											Running balance across all spins
										</p>
									</div>
								</div>
								<span className="text-3xl font-black text-emerald-600">{totalTickets}</span>
							</div>
						</section>
					</div>

					<aside className="w-full md:w-80 md:flex-none">
						<div className="flex flex-col gap-4">
							<section
								className={joinClasses(
									"rounded-[24px] border border-emerald-100 bg-white/60 backdrop-blur-sm px-5 py-6",
									"shadow-sm",
								)}
							>
								<header className="mb-5">
									<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1">
										Controls
									</p>
									<p className="text-xs font-medium text-emerald-800/60 leading-relaxed">
										Use the spin button or press spacebar. Bonuses spin automatically.
									</p>
								</header>
								<button
									type="button"
									onClick={slots.handleSpin}
									className={joinClasses(
										"hidden md:inline-flex w-full items-center justify-center rounded-2xl border border-emerald-400/30",
										"bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-4 text-base font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-900/20",
										"transition-all hover:from-emerald-500 hover:to-emerald-400 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0",
										"disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none",
									)}
									disabled={
										slots.isSpinning ||
										(!slots.canSpin && !slots.showActivateBonus) ||
										slots.showInstantWinModal ||
										slots.instantWonData !== null
									}
								>
									{spinLabel}
								</button>
								<div
									className={joinClasses(
										"mt-4 rounded-2xl border border-emerald-100/80 bg-white/50",
										"px-4 py-3",
									)}
								>
									<div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
										<span>Volume</span>
										<span>{slots.isMuted ? "Muted" : `${volumePercent}%`}</span>
									</div>
									<div className="mt-3 flex items-center gap-3">
										<input
											className="h-1.5 flex-1 appearance-none rounded-full bg-emerald-100 accent-emerald-500 cursor-pointer"
											type="range"
											min={sliderMin}
											max={sliderMax}
											step={sliderStep}
											value={slots.isMuted ? sliderMin : volumePercent}
											onChange={handleVolumeChange}
										/>
										<button
											type="button"
											onClick={slots.toggleMute}
											className={joinClasses(
												"inline-flex h-8 w-8 items-center justify-center rounded-full border",
												"border-emerald-200 bg-white text-sm text-emerald-600 transition",
												"hover:bg-emerald-50 hover:border-emerald-300 focus:outline-none focus-visible:ring-2",
												"focus-visible:ring-emerald-400",
											)}
										>
											{slots.isMuted ? "🔇" : "🔊"}
										</button>
									</div>
								</div>
								<div
									className={joinClasses(
										"mt-3 rounded-2xl border border-emerald-100/70 bg-white/50 px-4 py-3",
										"text-xs text-emerald-800",
									)}
								>
									<div className="flex justify-between items-center mb-1">
										<span className="opacity-60">Remaining spins</span>
										<span className="font-bold text-emerald-700">{slots.spinsLeft}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="opacity-60">Session tickets</span>
										<span className="font-bold text-emerald-700">{slots.ticketsEarned}</span>
									</div>
								</div>
							</section>

							{slots.pendingBonuses.length > 0 && !slots.showActivateBonus && (
								<section
									className={joinClasses(
										"rounded-[24px] border border-purple-200 bg-purple-50/80 px-5 py-5",
										"text-purple-900",
									)}
								>
									<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-3">
										Queued bonuses
									</p>
									<ul className="space-y-2 text-sm">
										{slots.pendingBonuses.map((bonus, index) => (
											<li
												key={`bonus-${bonus.symbol}-${index}`}
												className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2 border border-purple-100"
											>
												<span className="flex items-center gap-2 font-semibold">
													<span className="text-lg">{bonus.symbol}</span>
													{bonus.label}
												</span>
												<span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
													{bonus.rounds} spins • {bonus.multiplier}×
												</span>
											</li>
										))}
									</ul>
								</section>
							)}

							<Link
								href="/profile"
								className={joinClasses(
									"inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/50 border border-white/60",
									"text-emerald-800/60 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-emerald-900 hover:shadow-md",
									"transition-all duration-300 backdrop-blur-sm group w-full",
								)}
							>
								<span className="group-hover:-translate-x-0.5 transition-transform">←</span>
								Back to profile
							</Link>

							<section
								className={joinClasses(
									"rounded-[24px] border border-emerald-100 bg-white/60 backdrop-blur-sm px-5 py-5",
									"text-sm text-emerald-800",
								)}
							>
								<div className="mb-3">
									<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1">
										Symbol values
									</p>
									<p className="text-xs font-medium text-emerald-800/50">
										Points awarded for a winning row of 5
									</p>
								</div>
								<div className="space-y-2">
									{symbolLegend.map((item) => (
										<div
											key={`legend-${item.symbol}`}
											className={joinClasses(
												"flex items-center justify-between rounded-xl border border-emerald-100/50",
												"bg-white/40 px-3 py-2",
											)}
										>
											<span className="text-xl">{item.symbol}</span>
											<span className="font-bold text-emerald-700">{item.multiplier}×</span>
										</div>
									))}
								</div>
							</section>

							<section
								className={joinClasses(
									"rounded-[24px] border border-emerald-100 bg-white/60 backdrop-blur-sm px-5 py-5",
									"text-sm text-emerald-800",
								)}
							>
								<div className="mb-3">
									<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1">
										Bonus rounds
									</p>
									<p className="text-xs font-medium text-emerald-800/50">
										Trigger special rounds by matching bonus symbols
									</p>
								</div>
								<div className="space-y-2">
									{SLOT_BONUS_DEFINITIONS.map((bonus) => (
										<div
											key={`bonus-legend-${bonus.symbol}`}
											className={joinClasses(
												"flex items-center justify-between rounded-xl border border-emerald-100/50",
												"bg-white/40 px-3 py-2",
											)}
										>
											<div className="flex items-center gap-2">
												<span className="text-xl">{bonus.symbol}</span>
												<div className="flex flex-col">
													<span className="text-xs font-bold">{bonus.label}</span>
													<span className="text-[10px] font-medium text-emerald-600/60">
														{bonus.minMatches} needed
													</span>
													{bonus.removeSymbols && bonus.removeSymbols.length > 0 && (
														<span className="text-[10px] font-medium text-emerald-600/60">
															Removes: {bonus.removeSymbols.join(" ")}
														</span>
													)}
												</div>
											</div>
											<span className="font-bold text-emerald-700 text-xs">
												{bonus.rounds} spins • {bonus.multiplier}×
											</span>
										</div>
									))}
								</div>
							</section>

							{instantWins.length > 0 && (
								<section
									className={joinClasses(
										"rounded-[24px] border border-amber-200 bg-amber-50/80 px-5 py-5",
										"text-sm text-amber-900",
									)}
								>
									<div className="mb-3">
										<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-1">
											🎁 Instant wins
										</p>
										<p className="text-xs font-medium text-amber-800/50">
											Special prizes to be won
										</p>
									</div>
									<div className="space-y-2">
										{availableInstantWins.map((prize) => (
											<div
												key={`instant-win-${prize.id}`}
												className={joinClasses(
													"flex items-center justify-between rounded-xl border border-amber-200/50",
													"bg-white/60 px-3 py-2",
												)}
											>
												<div className="flex min-w-0 flex-1 items-center gap-2">
													{INSTANT_WIN_IMAGES[prize.id] && (
														<div className="flex-shrink-0">
															<div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm">
																<Image
																	src={INSTANT_WIN_IMAGES[prize.id]}
																	alt={prize.name}
																	width={32}
																	height={32}
																	className="w-full h-full object-cover"
																/>
															</div>
														</div>
													)}
													<span className="truncate text-xs font-bold text-amber-900">
														{prize.name}
													</span>
												</div>
												{prize.value && (
													<span className="flex-shrink-0 ml-2 font-bold text-amber-700">
														${prize.value}
													</span>
												)}
											</div>
										))}
										{availableInstantWins.length === 0 && (
											<p className="rounded-xl border border-amber-200/50 bg-white/40 px-3 py-3 text-xs font-medium text-amber-800/50 text-center italic">
												All instant wins have been claimed!
											</p>
										)}
									</div>
								</section>
							)}
						</div>
					</aside>
				</div>
			</div>

			{/* Instant win modal */}
			{slots.instantWonData && (
				<InstantWinModal
					instantWin={slots.instantWonData}
					imageUrl={INSTANT_WIN_IMAGES[slots.instantWonData.id]}
					isOpen={slots.showInstantWinModal}
					onClose={() => {
						slots.setShowInstantWinModal(false);
						slots.setInstantWonData(null);
					}}
					onClaim={async () => {
						// Database already updated when instant win was detected
					}}
				/>
			)}
		</div>
	);
};

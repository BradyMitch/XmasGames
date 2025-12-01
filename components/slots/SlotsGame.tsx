/** biome-ignore-all lint/suspicious/noArrayIndexKey: Uses index for stable grid mapping */
"use client";

import Link from "next/link";
import { type ChangeEvent, useMemo } from "react";
import {
	SLOT_BONUS_DEFINITIONS,
	SLOT_REEL_COUNT,
	SLOT_ROW_COUNT,
	SLOT_SYMBOL_MULTIPLIERS,
	SLOT_SYMBOL_WEIGHTS,
	SLOT_VOLUME_RANGE,
} from "@/utils/constants/slots";
import { useSlotsGame } from "./useSlotsGame";

type SlotsGameProps = {
	initialSpins: number;
	initialTickets: number;
	onSpinCompleted?: (spinCount: number) => Promise<{ success: boolean; error?: string }>;
	onTicketsEarned?: (ticketCount: number) => Promise<{ success: boolean; error?: string }>;
};

const DEFAULT_SYMBOL = "🎄";
const joinClasses = (...classes: string[]) => classes.join(" ");

export const SlotsGame = ({
	initialSpins,
	initialTickets,
	onSpinCompleted,
	onTicketsEarned,
}: SlotsGameProps) => {
	const slots = useSlotsGame({ initialSpins, onSpinCompleted, onTicketsEarned });

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
		const isBonusReel = slots.bonusReels[reelIndex];
		const isStopped = slots.stoppedReels[reelIndex];
		const isBonusTriggered = isBonus && slots.lastWin.bonusTriggered === symbol;

		if (slots.isSpinning && !isStopped) {
			cellClasses.push("animate-pulse");
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
				<span>{symbol}</span>
				{isWinning && (
					<span className="absolute right-2 top-2 text-[10px] font-semibold uppercase text-yellow-200">
						Win
					</span>
				)}
				{!isWinning && isBonus && isBonusTriggered && (
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
					"rounded-3xl border border-white/70 bg-white/90 px-6 py-8 shadow-2xl",
					"backdrop-blur-md md:px-10 md:py-10",
				)}
			>
				<header className={joinClasses("mb-8", "flex flex-col items-center gap-3")}>
					<div
						className={joinClasses(
							"inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50",
							"px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-700",
						)}
					>
						<span className="text-[10px]">●</span>
						Christmas Slots
					</div>
					<h1
						className={joinClasses(
							"text-center text-2xl font-extrabold tracking-tight text-emerald-950",
							"md:text-3xl lg:text-4xl",
						)}
					>
						Slot Machine
					</h1>
					<p className="max-w-xl text-center text-sm text-emerald-700/80">
						Spin to collect tickets, trigger holiday bonuses, and chase the festive jackpot.
					</p>
				</header>

				<div className="flex flex-col gap-8 md:flex-row md:items-start">
					<div className="flex min-w-0 flex-1 flex-col gap-6">
						<section
							className={joinClasses(
								"rounded-3xl border border-emerald-800/80 bg-emerald-950/90 p-5",
								"shadow-[0_30px_60px_rgba(15,118,110,0.45)]",
							)}
						>
							<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
										Current spin
									</p>
									<p className="text-sm text-emerald-100/80">Spins left: {slots.spinsLeft}</p>
								</div>
								{slots.activeWeightedSymbol && (
									<span
										className={joinClasses(
											"inline-flex items-center gap-2 rounded-full border border-amber-400/60",
											"bg-amber-400/20 px-3 py-1 text-xs font-medium text-amber-200",
										)}
									>
										Increased Odds
										<span className="text-lg">{slots.activeWeightedSymbol}</span>
									</span>
								)}
							</div>
							<div
								className={joinClasses("grid gap-1.5 md:gap-3")}
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
								"md:hidden inline-flex w-full items-center justify-center rounded-2xl border border-emerald-300",
								"bg-emerald-600 px-4 py-3 text-base font-semibold text-emerald-50 shadow-md",
								"transition-all hover:bg-emerald-500 focus:outline-none focus-visible:ring-2",
								"focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:border-emerald-200",
								"disabled:bg-emerald-200 disabled:text-emerald-500",
							)}
							disabled={slots.isSpinning || (!slots.canSpin && !slots.showActivateBonus)}
						>
							{spinLabel}
						</button>

						{(slots.bonusRoundsLeft > 0 || slots.bonusJustEnded) && (
							<section
								className={joinClasses(
									"rounded-3xl border-2 border-yellow-300 bg-yellow-50/95 px-5 py-5",
									"text-yellow-800 shadow-md",
								)}
							>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-3">
											<span className="text-2xl">{activeBonusDefinition?.symbol ?? "🎯"}</span>
											<div>
												<p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
													Bonus round active
												</p>
												<p className="text-xs opacity-80">
													{activeBonusDefinition?.label ?? "Holiday Bonus"}
												</p>
											</div>
										</div>
										<div className="flex items-baseline gap-2 text-yellow-800">
											<span className="text-2xl font-extrabold">{slots.bonusRoundsLeft}</span>
											<span className="text-xs">
												spins left • {slots.bonusMultiplier}× multiplier
											</span>
										</div>
									</div>
									<div
										className={joinClasses(
											"flex items-center justify-between rounded-xl border border-yellow-200",
											"bg-yellow-100/70 px-3 py-2",
										)}
									>
										<span>Bonus tickets earned</span>
										<span className="text-lg font-semibold">{slots.bonusTicketsEarned}</span>
									</div>
								</div>
							</section>
						)}

						<section
							className={joinClasses(
								"rounded-3xl border border-emerald-800/80 bg-emerald-900/95 px-5 py-6 text-emerald-50",
								"shadow-[0_20px_45px_rgba(15,118,110,0.35)]",
							)}
						>
							<header className="mb-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="text-lg">{hasWinningRows ? "🎉" : "✨"}</span>
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/90">
											Last spin summary
										</p>
										<p className="text-[11px] text-emerald-200/70">
											Tickets and bonuses from the previous spin
										</p>
									</div>
								</div>
								<div className="text-lg font-semibold text-yellow-300">
									{hasWinningRows ? `${totalTicketsText} tickets` : "No tickets this spin"}
								</div>
							</header>
							<div className="space-y-2 text-sm">
								{hasWinningRows ? (
									slots.lastWin.rows.map((row, index) => (
										<div
											key={`win-row-${row.symbol}-${index}`}
											className={joinClasses(
												"flex items-center justify-between rounded-xl border border-emerald-700/80",
												"bg-emerald-950/60 px-3 py-3",
											)}
										>
											<span className="text-lg">{row.symbol}</span>
											<span className="font-semibold text-yellow-200">
												{row.multiplier * slots.lastWin.bonusMultiplier} tickets
											</span>
										</div>
									))
								) : (
									<p
										className={joinClasses(
											"rounded-xl border border-emerald-700/70 bg-emerald-950/60",
											"px-3 py-3 text-emerald-200/70",
										)}
									>
										No winning rows yet—spin to try again!
									</p>
								)}
							</div>
							{triggeredBonusDefinition && (
								<div
									className={joinClasses(
										"mt-4 flex items-center justify-between rounded-xl border border-purple-400/40",
										"bg-purple-500/15 px-3 py-2 text-sm text-purple-100",
									)}
								>
									<span className="flex items-center gap-2 font-semibold">
										<span className="text-lg">{triggeredBonusDefinition.symbol}</span>
										{triggeredBonusDefinition.label}
									</span>
									<span className="text-[11px] uppercase tracking-[0.16em]">Bonus ready</span>
								</div>
							)}
						</section>

						<section
							className={joinClasses(
								"rounded-3xl border border-emerald-800/80 bg-emerald-900/95 px-5 py-5",
								"text-emerald-50",
							)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="text-lg">🎫</span>
									<div>
										<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">
											Total tickets
										</p>
										<p className="text-[11px] text-emerald-200/60">
											Running balance across all spins
										</p>
									</div>
								</div>
								<span className="text-lg font-semibold text-yellow-300">{totalTickets}</span>
							</div>
						</section>
					</div>

					<aside className="w-full md:w-80 md:flex-none">
						<div className="flex flex-col gap-4">
							<section
								className={joinClasses(
									"rounded-3xl border border-emerald-100 bg-white/90 px-5 py-5",
									"shadow-sm",
								)}
							>
								<header className="mb-4">
									<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
										Controls
									</p>
									<p className="text-xs text-emerald-600/80">
										Use the spin button or press spacebar. Bonuses activate automatically.
									</p>
								</header>
								<button
									type="button"
									onClick={slots.handleSpin}
									className={joinClasses(
										"hidden md:inline-flex w-full items-center justify-center rounded-2xl border border-emerald-300",
										"bg-emerald-600 px-4 py-3 text-base font-semibold text-emerald-50 shadow-md",
										"transition-all hover:bg-emerald-500 focus:outline-none focus-visible:ring-2",
										"focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:border-emerald-200",
										"disabled:bg-emerald-200 disabled:text-emerald-500",
									)}
									disabled={slots.isSpinning || (!slots.canSpin && !slots.showActivateBonus)}
								>
									{spinLabel}
								</button>
								<div
									className={joinClasses(
										"mt-3 rounded-2xl border border-emerald-100/80 bg-white/70",
										"px-4 py-3",
									)}
								>
									<div className="flex items-center justify-between text-xs text-emerald-700">
										<span>Volume</span>
										<span>{slots.isMuted ? "Muted" : `${volumePercent}%`}</span>
									</div>
									<div className="mt-2 flex items-center gap-3">
										<input
											className="h-1 flex-1 appearance-none rounded-full bg-emerald-200 accent-emerald-600"
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
												"inline-flex h-10 w-10 items-center justify-center rounded-full border",
												"border-emerald-200 bg-white text-lg text-emerald-600 transition",
												"hover:bg-emerald-50 focus:outline-none focus-visible:ring-2",
												"focus-visible:ring-emerald-400",
											)}
										>
											{slots.isMuted ? "🔇" : "🔊"}
										</button>
									</div>
								</div>
								<div
									className={joinClasses(
										"mt-3 rounded-2xl border border-emerald-100/70 bg-white/70 px-4 py-3",
										"text-xs text-emerald-700",
									)}
								>
									<p>
										Remaining spins: <span className="font-semibold">{slots.spinsLeft}</span>
									</p>
									<p>
										Tickets earned this session:{" "}
										<span className="font-semibold">{slots.ticketsEarned}</span>
									</p>
								</div>
							</section>

							{slots.pendingBonuses.length > 0 && !slots.showActivateBonus && (
								<section
									className={joinClasses(
										"rounded-3xl border border-purple-300/60 bg-purple-100/60 px-5 py-4",
										"text-purple-800",
									)}
								>
									<p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
										Queued bonuses
									</p>
									<ul className="mt-2 space-y-2 text-sm">
										{slots.pendingBonuses.map((bonus, index) => (
											<li
												key={`bonus-${bonus.symbol}-${index}`}
												className="flex items-center justify-between"
											>
												<span className="flex items-center gap-2">
													<span className="text-lg">{bonus.symbol}</span>
													{bonus.label}
												</span>
												<span className="text-xs uppercase tracking-[0.12em]">
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
									"inline-flex items-center justify-center rounded-2xl border border-emerald-200",
									"bg-white/80 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm",
									"transition hover:border-emerald-400 hover:bg-emerald-50",
								)}
							>
								<span className="mr-1.5">←</span>
								Back to profile
							</Link>

							<section
								className={joinClasses(
									"rounded-3xl border border-emerald-100 bg-white/95 px-5 py-5",
									"text-sm text-emerald-800",
								)}
							>
								<div>
									<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
										Symbol values
									</p>
									<p className="mt-1 text-xs text-emerald-600/70">
										Points awarded for a winning row of 5
									</p>
								</div>
								<div className="mt-3 space-y-2">
									{symbolLegend.map((item) => (
										<div
											key={`legend-${item.symbol}`}
											className={joinClasses(
												"flex items-center justify-between rounded-xl border border-emerald-100/70",
												"bg-white/60 px-3 py-2",
											)}
										>
											<span className="text-lg">{item.symbol}</span>
											<span className="font-semibold text-emerald-700">{item.multiplier}×</span>
										</div>
									))}
								</div>
							</section>

							<section
								className={joinClasses(
									"rounded-3xl border border-emerald-100 bg-white/95 px-5 py-5",
									"text-sm text-emerald-800",
								)}
							>
								<div>
									<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
										Bonus rounds
									</p>
									<p className="mt-1 text-xs text-emerald-600/70">
										Trigger special rounds by matching bonus symbols
									</p>
								</div>
								<div className="mt-3 space-y-2">
									{SLOT_BONUS_DEFINITIONS.map((bonus) => (
										<div
											key={`bonus-legend-${bonus.symbol}`}
											className={joinClasses(
												"flex items-center justify-between rounded-xl border border-emerald-100/70",
												"bg-white/60 px-3 py-2",
											)}
										>
											<div className="flex items-center gap-2">
												<span className="text-lg">{bonus.symbol}</span>
												<div className="flex flex-col">
													<span className="text-xs font-semibold">{bonus.label}</span>
													<span className="text-[10px] text-emerald-600/70">
														{bonus.minMatches} needed
													</span>
													{bonus.removeSymbols && bonus.removeSymbols.length > 0 && (
														<span className="text-[10px] text-emerald-600/70">
															Removes: {bonus.removeSymbols.join(" ")}
														</span>
													)}
												</div>
											</div>
											<span className="font-semibold text-emerald-700">
												{bonus.rounds} spins • {bonus.multiplier}×
											</span>
										</div>
									))}
								</div>
							</section>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
};

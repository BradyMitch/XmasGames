"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	SLOT_AUDIO_LEVELS,
	SLOT_AUTO_SPIN_DELAYS,
	SLOT_BONUS_DEFINITIONS,
	SLOT_DEFAULT_VOLUME,
	SLOT_INTERACTION_EVENTS,
	SLOT_PROBABILITIES,
	SLOT_REEL_COUNT,
	SLOT_ROW_COUNT,
	SLOT_SPIN_TIMING,
	SLOT_SYMBOL_BONUS_WEIGHTS,
	SLOT_SYMBOL_MULTIPLIERS,
	SLOT_SYMBOL_WEIGHTS,
	SLOT_VOLUME_RANGE,
	type SlotPendingBonus,
} from "@/utils/constants/slots";

type WinningRow = {
	symbol: string;
	multiplier: number;
};

export type LastWin = {
	totalTickets: number;
	baseTickets: number;
	rows: WinningRow[];
	bonusTriggered: string | null;
	bonusMultiplier: number;
	spinId: number;
};

type UseSlotsGameArgs = {
	initialSpins: number;
	onSpinCompleted?: (spinCount: number) => Promise<{ success: boolean; error?: string }>;
	onTicketsEarned?: (ticketCount: number) => Promise<{ success: boolean; error?: string }>;
};

type UseSlotsGameResult = {
	symbolsRef: React.MutableRefObject<string[]>;
	reelPositions: number[];
	stoppedReels: boolean[];
	bonusReels: boolean[];
	winningCells: Set<string>;
	bonusCells: Set<string>;
	isSpinning: boolean;
	spinsLeft: number;
	ticketsEarned: number;
	bonusTicketsEarned: number;
	bonusRoundsLeft: number;
	bonusMultiplier: number;
	bonusActivated: boolean;
	pendingBonuses: SlotPendingBonus[];
	showActivateBonus: boolean;
	activeWeightedSymbol: string | null;
	activeBonusSymbol: string | null;
	lastWin: LastWin;
	handleSpin: () => void;
	canSpin: boolean;
	volume: number;
	setVolume: (value: number) => void;
	isMuted: boolean;
	toggleMute: () => void;
	bonusJustEnded: boolean;
};

const EMPTY_LAST_WIN: LastWin = {
	totalTickets: 0,
	baseTickets: 0,
	rows: [],
	bonusTriggered: null,
	bonusMultiplier: 1,
	spinId: 0,
};

const clampVolume = (value: number) =>
	Math.min(Math.max(value, SLOT_VOLUME_RANGE.min), SLOT_VOLUME_RANGE.max);

export const useSlotsGame = ({
	initialSpins,
	onSpinCompleted,
	onTicketsEarned,
}: UseSlotsGameArgs): UseSlotsGameResult => {
	const symbolsRef = useRef<string[]>([]);
	const [reelPositions, setReelPositions] = useState<number[]>(
		Array.from({ length: SLOT_REEL_COUNT }, () => 0),
	);
	const [isSpinning, setIsSpinning] = useState(false);
	const [spinsLeft, setSpinsLeft] = useState(initialSpins);
	const [ticketsEarned, setTicketsEarned] = useState(0);
	const [bonusTicketsEarned, setBonusTicketsEarned] = useState(0);
	const [stoppedReels, setStoppedReels] = useState<boolean[]>(
		Array.from({ length: SLOT_REEL_COUNT }, () => false),
	);
	const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
	const [bonusCells, setBonusCells] = useState<Set<string>>(new Set());
	const [bonusReels, setBonusReels] = useState<boolean[]>(
		Array.from({ length: SLOT_REEL_COUNT }, () => false),
	);
	const [bonusActivated, setBonusActivated] = useState(false);
	const [lastWin, setLastWin] = useState<LastWin>(EMPTY_LAST_WIN);
	const [bonusRoundsLeft, setBonusRoundsLeft] = useState(0);
	const [bonusMultiplier, setBonusMultiplier] = useState(1);
	const [pendingBonuses, setPendingBonuses] = useState<SlotPendingBonus[]>([]);
	const [showActivateBonus, setShowActivateBonus] = useState(false);
	const [activeWeightedSymbol, setActiveWeightedSymbol] = useState<string | null>(null);
	const [activeBonusSymbol, setActiveBonusSymbol] = useState<string | null>(null);
	const [bonusJustEnded, setBonusJustEnded] = useState(false);
	const hadBonusRoundRef = useRef(false);
	const bonusTicketsTransferredRef = useRef(false);

	const spinsRef = useRef(initialSpins);
	const bonusSymbolRef = useRef<string | null>(null);
	const activeBonusSymbolRef = useRef<string | null>(null);
	const prevIsSpinningRef = useRef<boolean>(false);
	const bonusFirstSpinRef = useRef<boolean>(true);
	const bonusSpinDecrementedRef = useRef<boolean>(false);
	const bonusFirstSpinTriggeredRef = useRef<boolean>(false);
	const lastSpinWonRef = useRef<boolean>(false);
	const lastSpinBonusWonRef = useRef<boolean>(false);
	const [spinCompletionCount, setSpinCompletionCount] = useState(0);
	const lastHandledAutoSpinRef = useRef<number>(0);
	const lastHandledSpinCompletionRef = useRef<boolean>(false);
	const performSpinRef = useRef<() => void>(() => {});
	const bonusRoundsLeftRef = useRef(0);
	const bonusMultiplierRef = useRef(1);
	const isSpinningRef = useRef(false);
	const spinStartTimeRef = useRef(0);

	const spinIntervalsRef = useRef<number[]>([]);
	const stopTimeoutsRef = useRef<number[]>([]);
	const bonusTimeoutRef = useRef<number | null>(null);
	const detectWinsCalledRef = useRef<boolean>(false);
	const bgMusicRef = useRef<HTMLAudioElement | null>(null);
	const bonusRunMusicRef = useRef<HTMLAudioElement | null>(null);
	const lastCountedWinRef = useRef<string>("");
	const spinCounterRef = useRef(0);
	const lastReportedSpinsRef = useRef(initialSpins);
	const lastReportedTicketsRef = useRef(0);
	const volumeRef = useRef(SLOT_DEFAULT_VOLUME);
	const mutedRef = useRef(false);

	const [volume, setVolumeState] = useState(SLOT_DEFAULT_VOLUME);
	const [isMuted, setIsMuted] = useState(false);

	const bonusDefinitionMap = useMemo(() => {
		const map = new Map<string, (typeof SLOT_BONUS_DEFINITIONS)[number]>();
		for (const definition of SLOT_BONUS_DEFINITIONS) {
			map.set(definition.symbol, definition);
		}
		return map;
	}, []);

	const clearAllTimers = useCallback(() => {
		spinIntervalsRef.current.forEach((id) => {
			window.clearInterval(id);
		});
		stopTimeoutsRef.current.forEach((id) => {
			window.clearTimeout(id);
		});
		if (bonusTimeoutRef.current !== null) {
			window.clearTimeout(bonusTimeoutRef.current);
			bonusTimeoutRef.current = null;
		}
		spinIntervalsRef.current = [];
		stopTimeoutsRef.current = [];
	}, []);

	const applyVolumeSettings = useCallback(() => {
		const effectiveVolume = mutedRef.current ? 0 : volumeRef.current;
		if (bgMusicRef.current) {
			bgMusicRef.current.volume = SLOT_AUDIO_LEVELS.background * effectiveVolume;
			bgMusicRef.current.muted = mutedRef.current;
		}
		if (bonusRunMusicRef.current) {
			bonusRunMusicRef.current.volume = SLOT_AUDIO_LEVELS.bonusRun * effectiveVolume;
			bonusRunMusicRef.current.muted = mutedRef.current;
		}
	}, []);

	const playSoundEffect = useCallback((src: string) => {
		if (mutedRef.current) {
			return;
		}
		const audio = new Audio(src);
		audio.volume = SLOT_AUDIO_LEVELS.effects * volumeRef.current;
		audio.play().catch(() => {
			// Ignore playback errors (e.g., browser autoplay restrictions)
		});
	}, []);

	const buildSymbols = useCallback(
		(bonusSymbol: string | null = null, symbolsToRemove: string[] = []) => {
			let weights = SLOT_SYMBOL_WEIGHTS;

			if (Math.random() < SLOT_PROBABILITIES.doveSymbol) {
				weights = [...weights, { symbol: "🕊️", weight: 1 }];
			}

			const removalSet = new Set(symbolsToRemove);
			if (removalSet.size > 0) {
				weights = weights.filter((item) => !removalSet.has(item.symbol));
			}

			if (bonusSymbol && SLOT_SYMBOL_BONUS_WEIGHTS[bonusSymbol] > 0) {
				weights = weights.map((item) =>
					item.symbol === bonusSymbol
						? { ...item, weight: item.weight + SLOT_SYMBOL_BONUS_WEIGHTS[bonusSymbol] }
						: item,
				);
			}

			if (Math.random() < SLOT_PROBABILITIES.randomRemoval && weights.length > 3) {
				const randomIndex = Math.floor(Math.random() * weights.length);
				weights = weights.filter((_, index) => index !== randomIndex);
			}

			const symbols = weights.flatMap((item) => Array(item.weight).fill(item.symbol));

			for (let i = 0; i < 5; i += 1) {
				for (let j = symbols.length - 1; j > 0; j -= 1) {
					const k = Math.floor(Math.random() * (j + 1));
					[symbols[j], symbols[k]] = [symbols[k], symbols[j]];
				}
			}

			return symbols;
		},
		[],
	);

	const highlightBonusInReel = useCallback(
		(reelIndex: number, positions: number[]) => {
			const bonusCellsInReel = new Set<string>();

			for (let rowIndex = 0; rowIndex < SLOT_ROW_COUNT; rowIndex += 1) {
				const symbol =
					symbolsRef.current[(positions[reelIndex] + rowIndex) % symbolsRef.current.length];
				if (bonusDefinitionMap.has(symbol)) {
					bonusCellsInReel.add(`cell-${reelIndex}-${rowIndex}`);
				}
			}

			if (bonusCellsInReel.size > 0) {
				setBonusCells((prev) => {
					const updated = new Set(prev);
					for (const cell of bonusCellsInReel) {
						updated.add(cell);
					}
					return updated;
				});

				setBonusReels((prev) => {
					const updated = [...prev];
					updated[reelIndex] = true;
					return updated;
				});
			}
		},
		[bonusDefinitionMap],
	);

	const detectWins = useCallback(
		(positions: number[]) => {
			if (detectWinsCalledRef.current) {
				return;
			}
			detectWinsCalledRef.current = true;

			const newWinningCells = new Set<string>();
			const newBonusCells = new Set<string>();
			const bonusCounts = new Map<string, number>();
			const winningRows: WinningRow[] = [];

			let baseTickets = 0;

			for (let rowIndex = 0; rowIndex < SLOT_ROW_COUNT; rowIndex += 1) {
				const rowSymbols = Array.from(
					{ length: SLOT_REEL_COUNT },
					(_, reelIndex) =>
						symbolsRef.current[(positions[reelIndex] + rowIndex) % symbolsRef.current.length],
				);

				const firstSymbol = rowSymbols[0];
				const isFullRowWin = rowSymbols.every((symbol) => symbol === firstSymbol);

				if (isFullRowWin) {
					for (let reelIndex = 0; reelIndex < SLOT_REEL_COUNT; reelIndex += 1) {
						newWinningCells.add(`cell-${reelIndex}-${rowIndex}`);
					}
					const multiplier = SLOT_SYMBOL_MULTIPLIERS[firstSymbol] ?? 1;
					winningRows.push({ symbol: firstSymbol, multiplier });
					baseTickets += multiplier;
				}
			}

			for (let reelIndex = 0; reelIndex < SLOT_REEL_COUNT; reelIndex += 1) {
				for (let rowIndex = 0; rowIndex < SLOT_ROW_COUNT; rowIndex += 1) {
					const symbol =
						symbolsRef.current[(positions[reelIndex] + rowIndex) % symbolsRef.current.length];
					if (!bonusCounts.has(symbol)) {
						bonusCounts.set(symbol, 0);
					}
					bonusCounts.set(symbol, (bonusCounts.get(symbol) ?? 0) + 1);
				}
			}

			for (const definition of SLOT_BONUS_DEFINITIONS) {
				const total = bonusCounts.get(definition.symbol) ?? 0;
				if (total >= definition.minMatches) {
					for (let reelIndex = 0; reelIndex < SLOT_REEL_COUNT; reelIndex += 1) {
						for (let rowIndex = 0; rowIndex < SLOT_ROW_COUNT; rowIndex += 1) {
							const symbol =
								symbolsRef.current[(positions[reelIndex] + rowIndex) % symbolsRef.current.length];
							if (symbol === definition.symbol) {
								newBonusCells.add(`cell-${reelIndex}-${rowIndex}`);
							}
						}
					}
				}
			}

			const triggeredBonus =
				SLOT_BONUS_DEFINITIONS.find((definition) => {
					const total = bonusCounts.get(definition.symbol) ?? 0;
					return total >= definition.minMatches;
				}) ?? null;

			if (winningRows.length > 0 || triggeredBonus !== null) {
				lastSpinWonRef.current = winningRows.length > 0;
				lastSpinBonusWonRef.current = triggeredBonus !== null;

				const currentBonusMultiplier =
					bonusRoundsLeftRef.current > 0 ? bonusMultiplierRef.current : 1;
				const totalTickets = baseTickets * currentBonusMultiplier;

				spinCounterRef.current += 1;
				setLastWin({
					totalTickets,
					baseTickets,
					rows: winningRows,
					bonusTriggered: triggeredBonus?.symbol ?? null,
					bonusMultiplier: currentBonusMultiplier,
					spinId: spinCounterRef.current,
				});

				if (triggeredBonus) {
					const queuedBonus: SlotPendingBonus = {
						symbol: triggeredBonus.symbol,
						label: triggeredBonus.label,
						rounds: triggeredBonus.rounds,
						multiplier: triggeredBonus.multiplier,
					};

					if (bonusRoundsLeftRef.current > 0) {
						setPendingBonuses((prev) => [...prev, queuedBonus]);
					} else {
						setShowActivateBonus(true);
						setPendingBonuses([queuedBonus]);
					}
				}

				setWinningCells(newWinningCells);
				setBonusCells(newBonusCells);

				if (winningRows.length > 0 || triggeredBonus !== null) {
					if (triggeredBonus?.symbol === "🕊️") {
						playSoundEffect("/slots-mega-bonus.wav");
					} else if (triggeredBonus) {
						playSoundEffect("/slots-jackpot.wav");
					} else {
						playSoundEffect("/slot-win.wav");
					}
				}
			} else {
				lastSpinWonRef.current = false;
				setBonusCells(new Set());
			}

			setSpinCompletionCount((prev) => prev + 1);
		},
		[playSoundEffect],
	);

	useEffect(() => {
		isSpinningRef.current = isSpinning;
	}, [isSpinning]);

	useEffect(() => {
		bonusRoundsLeftRef.current = bonusRoundsLeft;
		if (bonusRoundsLeft > 0) {
			hadBonusRoundRef.current = true;
		}
		if (bonusRoundsLeft === 0 && hadBonusRoundRef.current) {
			bonusFirstSpinTriggeredRef.current = false;
			activeBonusSymbolRef.current = null;
			setActiveBonusSymbol(null);
			setBonusJustEnded(true);
		}
	}, [bonusRoundsLeft]);

	useEffect(() => {
		bonusMultiplierRef.current = bonusMultiplier;
	}, [bonusMultiplier]);

	useEffect(() => {
		volumeRef.current = volume;
		applyVolumeSettings();
	}, [volume, applyVolumeSettings]);

	useEffect(() => {
		mutedRef.current = isMuted;
		applyVolumeSettings();
	}, [isMuted, applyVolumeSettings]);

	useEffect(() => {
		symbolsRef.current = buildSymbols();
		spinsRef.current = initialSpins;
		setSpinsLeft(initialSpins);

		const randomPositions: number[] = [];
		for (let i = 0; i < SLOT_REEL_COUNT; i += 1) {
			randomPositions.push(Math.floor(Math.random() * symbolsRef.current.length));
		}
		setReelPositions(randomPositions);

		if (!bgMusicRef.current) {
			const audio = new Audio("/slots-bg.wav");
			audio.loop = true;
			bgMusicRef.current = audio;
			applyVolumeSettings();
		}

		const startMusic = () => {
			if (bgMusicRef.current?.paused) {
				bgMusicRef.current.play().catch(() => {
					// Ignore playback errors caused by autoplay restrictions
				});
			}
		};

		for (const event of SLOT_INTERACTION_EVENTS) {
			document.addEventListener(event, startMusic);
		}

		return () => {
			clearAllTimers();
			for (const event of SLOT_INTERACTION_EVENTS) {
				document.removeEventListener(event, startMusic);
			}
			if (bgMusicRef.current) {
				bgMusicRef.current.pause();
				bgMusicRef.current.currentTime = 0;
			}
			if (bonusRunMusicRef.current) {
				bonusRunMusicRef.current.pause();
				bonusRunMusicRef.current.currentTime = 0;
			}
		};
	}, [applyVolumeSettings, buildSymbols, clearAllTimers, initialSpins]);

	useEffect(() => {
		if (bonusRoundsLeft > 0) {
			if (!bonusRunMusicRef.current) {
				const audio = new Audio("/slots-jackpot-run.wav");
				audio.loop = true;
				bonusRunMusicRef.current = audio;
				applyVolumeSettings();
			}
			if (bonusRunMusicRef.current.paused) {
				bonusRunMusicRef.current.play().catch(() => {
					// Ignore playback errors caused by autoplay restrictions
				});
			}
		} else if (!isSpinning) {
			if (bonusRunMusicRef.current && !bonusRunMusicRef.current.paused) {
				bonusRunMusicRef.current.pause();
				bonusRunMusicRef.current.currentTime = 0;
			}
		}
	}, [bonusRoundsLeft, isSpinning, applyVolumeSettings]);

	const performSpin = useCallback(() => {
		const hasSpinsAvailable = spinsRef.current > 0;
		const isBonusAboutToStart = showActivateBonus && bonusRoundsLeft === 0;

		if (isSpinningRef.current || (!hasSpinsAvailable && !isBonusAboutToStart)) {
			return;
		}

		spinStartTimeRef.current = performance.now();
		isSpinningRef.current = true;
		setIsSpinning(true);
		lastHandledAutoSpinRef.current = 0;
		lastHandledSpinCompletionRef.current = false;
		detectWinsCalledRef.current = false;
		setWinningCells(new Set());
		setBonusCells(new Set());
		setBonusReels(Array.from({ length: SLOT_REEL_COUNT }, () => false));

		if (bonusRoundsLeft === 0 && !isBonusAboutToStart) {
			spinsRef.current -= 1;
			setSpinsLeft(spinsRef.current);
		}

		if (Math.random() < SLOT_PROBABILITIES.bonusWeight) {
			const allSymbols = SLOT_SYMBOL_WEIGHTS.map((item) => item.symbol);
			const selectedSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
			bonusSymbolRef.current = selectedSymbol;
			setActiveWeightedSymbol(selectedSymbol);
			setBonusActivated(true);
		} else {
			bonusSymbolRef.current = null;
			setActiveWeightedSymbol(null);
			setBonusActivated(false);
		}

		const activeBonusConfig = activeBonusSymbolRef.current
			? bonusDefinitionMap.get(activeBonusSymbolRef.current)
			: null;
		const removalSymbols = activeBonusConfig?.removeSymbols ?? [];

		symbolsRef.current = buildSymbols(bonusSymbolRef.current, removalSymbols);

		clearAllTimers();
		setStoppedReels(Array.from({ length: SLOT_REEL_COUNT }, () => false));

		const { spinSpeed, baseStopDelay, perReelDelay } = SLOT_SPIN_TIMING;

		for (let reelIndex = 0; reelIndex < SLOT_REEL_COUNT; reelIndex += 1) {
			const intervalId = window.setInterval(() => {
				setReelPositions((prev) => {
					const next = [...prev];
					next[reelIndex] = (next[reelIndex] + 1) % symbolsRef.current.length;
					return next;
				});
			}, spinSpeed);

			spinIntervalsRef.current.push(intervalId);

			const stopTimeoutId = window.setTimeout(
				() => {
					window.clearInterval(intervalId);

					setStoppedReels((prev) => {
						const next = [...prev];
						next[reelIndex] = true;
						return next;
					});

					setReelPositions((currentPositions) => {
						highlightBonusInReel(reelIndex, currentPositions);
						return currentPositions;
					});

					if (reelIndex === SLOT_REEL_COUNT - 1) {
						setIsSpinning(false);

						const detectWinsTimeout = window.setTimeout(() => {
							setReelPositions((currentPositions) => {
								detectWins(currentPositions);
								return currentPositions;
							});
						}, 100);
						stopTimeoutsRef.current.push(detectWinsTimeout);
					}
				},
				baseStopDelay + reelIndex * perReelDelay,
			);

			stopTimeoutsRef.current.push(stopTimeoutId);
		}
	}, [
		bonusRoundsLeft,
		bonusDefinitionMap,
		buildSymbols,
		clearAllTimers,
		detectWins,
		highlightBonusInReel,
		showActivateBonus,
	]);

	useEffect(() => {
		performSpinRef.current = performSpin;
	}, [performSpin]);

	useEffect(() => {
		if (bonusRoundsLeft > 0 && !isSpinning && !bonusFirstSpinTriggeredRef.current) {
			bonusFirstSpinTriggeredRef.current = true;
			performSpin();
		}
	}, [bonusRoundsLeft, isSpinning, performSpin]);

	useEffect(() => {
		if (bonusRoundsLeftRef.current === 0) {
			return;
		}

		if (lastHandledAutoSpinRef.current === spinCompletionCount) {
			return;
		}
		lastHandledAutoSpinRef.current = spinCompletionCount;

		let delayMs = SLOT_AUTO_SPIN_DELAYS.default;
		if (lastSpinBonusWonRef.current) {
			delayMs = SLOT_AUTO_SPIN_DELAYS.bonusWin;
		} else if (lastSpinWonRef.current) {
			delayMs = SLOT_AUTO_SPIN_DELAYS.win;
		}

		bonusTimeoutRef.current = window.setTimeout(() => {
			performSpinRef.current();
		}, delayMs);

		return () => {
			if (bonusTimeoutRef.current !== null) {
				window.clearTimeout(bonusTimeoutRef.current);
				bonusTimeoutRef.current = null;
			}
		};
	}, [spinCompletionCount]);

	useEffect(() => {
		if (bonusRoundsLeft === 0 && !isSpinning && pendingBonuses.length > 0) {
			setShowActivateBonus(true);
			setBonusTicketsEarned(0);
		}
	}, [bonusRoundsLeft, isSpinning, pendingBonuses]);

	useEffect(() => {
		const spinJustStarted = !prevIsSpinningRef.current && isSpinning;
		prevIsSpinningRef.current = isSpinning;

		if (bonusRoundsLeft > 0 && spinJustStarted && !bonusSpinDecrementedRef.current) {
			if (!bonusFirstSpinRef.current) {
				setBonusRoundsLeft((prev) => Math.max(0, prev - 1));
			} else {
				bonusFirstSpinRef.current = false;
			}
			bonusSpinDecrementedRef.current = true;
		}

		if (!isSpinning) {
			bonusSpinDecrementedRef.current = false;
		}

		if (bonusRoundsLeft === 0) {
			bonusFirstSpinRef.current = true;
		}
	}, [bonusRoundsLeft, isSpinning]);

	const handleSpin = useCallback(() => {
		if (isSpinning) {
			return;
		}

		if (showActivateBonus && pendingBonuses.length > 0) {
			const [nextBonus, ...rest] = pendingBonuses;
			setPendingBonuses(rest);
			setBonusRoundsLeft(nextBonus.rounds);
			setBonusMultiplier(nextBonus.multiplier);
			setBonusTicketsEarned(0);
			setShowActivateBonus(false);
			activeBonusSymbolRef.current = nextBonus.symbol;
			setActiveBonusSymbol(nextBonus.symbol);
			return;
		}

		if (spinsRef.current > 0 && bonusRoundsLeft === 0) {
			setWinningCells(new Set());
			setBonusJustEnded(false);
			hadBonusRoundRef.current = false;
			bonusTicketsTransferredRef.current = false;
			setBonusTicketsEarned(0);
			setLastWin(EMPTY_LAST_WIN);
			performSpin();
		}
	}, [isSpinning, showActivateBonus, pendingBonuses, bonusRoundsLeft, performSpin]);

	useEffect(() => {
		const winKey = `spin-${lastWin.spinId}`;
		if (lastWin.baseTickets > 0 && winKey !== lastCountedWinRef.current) {
			lastCountedWinRef.current = winKey;
			if (bonusRoundsLeft > 0) {
				setBonusTicketsEarned((prev) => prev + lastWin.totalTickets);
			} else {
				setTicketsEarned((prev) => prev + lastWin.totalTickets);
			}
		}
	}, [lastWin, bonusRoundsLeft]);

	useEffect(() => {
		if (
			bonusRoundsLeft === 0 &&
			bonusTicketsEarned > 0 &&
			hadBonusRoundRef.current &&
			!bonusTicketsTransferredRef.current
		) {
			bonusTicketsTransferredRef.current = true;
			setTicketsEarned((prev) => prev + bonusTicketsEarned);
		}
	}, [bonusRoundsLeft, bonusTicketsEarned]);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				event.preventDefault();
				handleSpin();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, [handleSpin]);

	useEffect(() => {
		const consumed = lastReportedSpinsRef.current - spinsLeft;
		if (consumed > 0 && onSpinCompleted) {
			lastReportedSpinsRef.current = spinsLeft;
			onSpinCompleted(consumed).catch((error) => {
				console.error("Failed to update spins in database:", error);
			});
		}
	}, [spinsLeft, onSpinCompleted]);

	useEffect(() => {
		const unreportedTickets = ticketsEarned - lastReportedTicketsRef.current;
		if (unreportedTickets > 0 && onTicketsEarned) {
			lastReportedTicketsRef.current = ticketsEarned;
			onTicketsEarned(unreportedTickets).catch((error) => {
				console.error("Failed to update tickets in database:", error);
			});
		}
	}, [ticketsEarned, onTicketsEarned]);

	const setVolume = useCallback((value: number) => {
		const clamped = clampVolume(value);
		setVolumeState(clamped);
	}, []);

	const toggleMute = useCallback(() => {
		setIsMuted((prev) => !prev);
	}, []);

	const canSpin = !isSpinning && spinsLeft > 0 && (bonusRoundsLeft === 0 || showActivateBonus);

	return {
		symbolsRef,
		reelPositions,
		stoppedReels,
		bonusReels,
		winningCells,
		bonusCells,
		isSpinning,
		spinsLeft,
		ticketsEarned,
		bonusTicketsEarned,
		bonusRoundsLeft,
		bonusMultiplier,
		bonusActivated,
		pendingBonuses,
		showActivateBonus,
		activeWeightedSymbol,
		activeBonusSymbol,
		lastWin,
		handleSpin,
		canSpin,
		volume,
		setVolume,
		isMuted,
		toggleMute,
		bonusJustEnded,
	};
};

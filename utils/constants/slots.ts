export type SlotSymbolWeight = {
	symbol: string;
	weight: number;
};

export type SlotBonusDefinition = {
	symbol: string;
	label: string;
	minMatches: number;
	rounds: number;
	multiplier: number;
	removeSymbols?: string[];
};

export type SlotPendingBonus = {
	symbol: string;
	label: string;
	rounds: number;
	multiplier: number;
};

export const SLOT_SYMBOL_WEIGHTS: SlotSymbolWeight[] = [
	{ symbol: "🎄", weight: 200 },
	{ symbol: "🎅", weight: 90 },
	{ symbol: "🥁", weight: 65 },
	{ symbol: "⛄", weight: 30 },
	{ symbol: "❄️", weight: 5 },
	{ symbol: "🚂", weight: 3 },
];

export const SLOT_SYMBOL_BONUS_WEIGHTS: Record<string, number> = {
	"🎄": 650,
	"🎅": 500,
	"🥁": 500,
	"⛄": 400,
	"❄️": 30,
	"🚂": 20,
};

export const SLOT_SYMBOL_MULTIPLIERS: Record<string, number> = {
	"🎄": 1,
	"🎅": 2,
	"🥁": 3,
	"⛄": 5,
	"❄️": 10,
	"🚂": 15,
};

export const SLOT_REEL_COUNT = 5;
export const SLOT_ROW_COUNT = 3;

export const SLOT_PROBABILITIES = {
	bonusWeight: 0.5,
	doveSymbol: 0.1,
	randomRemoval: 0.05,
};

export const SLOT_SPIN_TIMING = {
	spinSpeed: 120,
	baseStopDelay: 1000,
	perReelDelay: 600,
};

export const SLOT_AUTO_SPIN_DELAYS = {
	default: 300,
	win: 1500,
	bonusWin: 3000,
};

export const SLOT_AUDIO_LEVELS = {
	background: 0.004,
	bonusRun: 0.03,
	effects: 0.03,
};

export const SLOT_DEFAULT_VOLUME = 0.6;

export const SLOT_VOLUME_RANGE = {
	min: 0,
	max: 1,
	step: 0.01,
};

export const SLOT_BONUS_DEFINITIONS: SlotBonusDefinition[] = [
	{
		symbol: "❄️",
		label: "Snowflake Bonus",
		minMatches: 3,
		rounds: 15,
		multiplier: 2,
	},
	{
		symbol: "🚂",
		label: "Train Bonus",
		minMatches: 3,
		rounds: 15,
		multiplier: 3,
	},
	{
		symbol: "🕊️",
		label: "Dove Bonus",
		minMatches: 1,
		rounds: 10,
		multiplier: 5,
		removeSymbols: ["🎄"],
	},
];

export const SLOT_INTERACTION_EVENTS = ["click", "touchstart", "keydown"] as const;

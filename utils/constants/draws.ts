export type PrizeDraw = {
	id: string;
	name: string;
	description: string;
	emoji: string;
};

export const PRIZE_DRAWS: PrizeDraw[] = [
	{
		id: "adult-prize-basket",
		name: "Adult Prize Basket",
		description: "A collection of premium gifts for adults",
		emoji: "🎁",
	},
	{
		id: "food-prize-basket",
		name: "Food Prize Basket",
		description: "Delicious treats and gourmet goodies",
		emoji: "🍫",
	},
	{
		id: "kids-prize-basket",
		name: "Kids Prize Basket",
		description: "Fun toys and games for the little ones",
		emoji: "🧸",
	},
];

export const DRAWS = ["Adult Prize Basket", "Food Prize Basket", "Kids Prize Basket"];

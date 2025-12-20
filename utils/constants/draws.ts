export type PrizeDraw = {
	id: string;
	name: string;
	description: string;
	emoji: string;
};

export const PRIZE_DRAWS: PrizeDraw[] = [
	{
		id: "boozy-bundle",
		name: "Boozy Bundle",
		description: "(19+) A collection of Vancouver Island alcoholic beverages",
		emoji: "🍾",
	},
	{
		id: "kitchen-kit",
		name: "Kitchen Kit",
		description: "Cook up a storm with this kitchen kit",
		emoji: "🍳",
	},
	{
		id: "sweet-treats",
		name: "Sweet Treats",
		description: "A basket full of delicious sweets and snacks",
		emoji: "🍬",
	},
	{
		id: "brew-basket",
		name: "Brew Basket",
		description: "Take a coffee break with this coffee lover's basket",
		emoji: "☕",
	},
	{
		id: "too-hot-to-handle",
		name: "Too Hot to Handle",
		description: "A basket full of spicy and hot treats",
		emoji: "🌶️",
	},
];

export const DRAWS = ["Boozy Bundle", "Kitchen Kit", "Sweet Treats", "Brew Basket", "Too Hot to Handle"];
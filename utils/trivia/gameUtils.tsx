import type { Database } from "@/types/supabase";

type QuizQuestion = Database["public"]["Tables"]["quiz_question"]["Row"] & {
	question_option: Database["public"]["Tables"]["question_option"]["Row"][];
};

export const TRIVIA_COLORS = [
	{ name: "red", bg: "bg-red-500", border: "border-red-700", text: "text-white" },
	{ name: "blue", bg: "bg-blue-500", border: "border-blue-700", text: "text-white" },
	{ name: "yellow", bg: "bg-yellow-400", border: "border-yellow-600", text: "text-white" },
	{ name: "green", bg: "bg-green-500", border: "border-green-700", text: "text-white" },
];

export const TRIVIA_SHAPES = ["triangle", "diamond", "circle", "square"] as const;

export function getShuffledOptions(question: QuizQuestion) {
	if (!question || !question.question_option) return [];

	// Deterministic shuffle based on question.id
	const options = [...question.question_option];

	// Sort by ID first to ensure consistent starting state across clients
	options.sort((a, b) => a.id.localeCompare(b.id));

	// Simple seeded random generator
	let seed = 0;
	for (let i = 0; i < question.id.length; i++) {
		seed = (seed << 5) - seed + question.id.charCodeAt(i);
		seed |= 0; // Convert to 32bit integer
	}

	const random = () => {
		const x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	};

	// Fisher-Yates shuffle
	for (let i = options.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[options[i], options[j]] = [options[j], options[i]];
	}

	return options.map((opt, index) => ({
		...opt,
		color: TRIVIA_COLORS[index % TRIVIA_COLORS.length],
		shape: TRIVIA_SHAPES[index % TRIVIA_SHAPES.length],
	}));
}

export function ShapeIcon({
	shape,
	className = "",
}: {
	shape: (typeof TRIVIA_SHAPES)[number];
	className?: string;
}) {
	switch (shape) {
		case "triangle":
			return (
				<svg viewBox="0 0 24 24" className={className} fill="currentColor">
					<title>Triangle</title>
					<path d="M12 2L22 22H2L12 2Z" />
				</svg>
			);
		case "diamond":
			return (
				<svg viewBox="0 0 24 24" className={className} fill="currentColor">
					<title>Diamond</title>
					<path d="M12 2L22 12L12 22L2 12L12 2Z" />
				</svg>
			);
		case "circle":
			return (
				<svg viewBox="0 0 24 24" className={className} fill="currentColor">
					<title>Circle</title>
					<circle cx="12" cy="12" r="10" />
				</svg>
			);
		case "square":
			return (
				<svg viewBox="0 0 24 24" className={className} fill="currentColor">
					<title>Square</title>
					<rect x="2" y="2" width="20" height="20" />
				</svg>
			);
	}
}

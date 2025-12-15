"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Database } from "@/types/supabase";
import type { PlayerAnswer } from "@/types/tables/PlayerAnswer";
import { createBrowserClient } from "@/utils/supabase/clients/browser";
import { getShuffledOptions, ShapeIcon } from "@/utils/trivia/gameUtils";

type GameSession = Database["public"]["Tables"]["game_session"]["Row"];
type TriviaPlayer = Database["public"]["Tables"]["trivia_player"]["Row"];
type SessionQuestion = Database["public"]["Tables"]["session_question"]["Row"];
type QuizQuestion = Database["public"]["Tables"]["quiz_question"]["Row"] & {
	question_option: Database["public"]["Tables"]["question_option"]["Row"][];
};
type Profile = Database["public"]["Tables"]["profile"]["Row"];

type Props = {
	joinGame(
		profileId: number,
		profileName: string,
		profileAvatar: string,
		gameId: string,
	): Promise<TriviaPlayer>;
	submitAnswer(
		playerId: string,
		sessionQuestionId: string,
		optionId: string,
		responseMs: number,
	): Promise<PlayerAnswer["Row"]>;
	getLeaderboard(sessionId: string): Promise<any[]>;
};

export default function TriviaPlayerView({ joinGame, submitAnswer, getLeaderboard }: Props) {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [activeSession, setActiveSession] = useState<GameSession | null>(null);
	const [player, setPlayer] = useState<TriviaPlayer | null>(null);
	const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
	const [currentSessionQuestionId, setCurrentSessionQuestionId] = useState<string | null>(null);
	const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
	const [gameState, setGameState] = useState<
		"searching" | "lobby" | "question" | "answered" | "results" | "leaderboard"
	>("searching");
	const [message, setMessage] = useState("Looking for active game...");
	const [startTime, setStartTime] = useState<number>(0);
	const [timeLeft, setTimeLeft] = useState(0);
	const [leaderboard, setLeaderboard] = useState<any[]>([]);
	const [showCorrectness, setShowCorrectness] = useState(false);
	const correctnessTimeoutRef = useRef<number | null>(null);

	const supabase = createBrowserClient();
	const router = useRouter();

	const shuffledOptions = useMemo(() => {
		if (!currentQuestion) return [];
		return getShuffledOptions(currentQuestion);
	}, [currentQuestion]);

	// Timer effect
	useEffect(() => {
		if (gameState !== "question" || timeLeft <= 0) return;
		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [gameState, timeLeft]);

	// Fetch profile from localStorage code
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		const code = localStorage.getItem("xmas-games-2025-code");
		if (!code) {
			router.push("/profile/create?next=/trivia");
			return;
		}

		const fetchProfile = async () => {
			const { data } = await supabase.from("profile").select("*").eq("code", code).single();
			if (data) {
				setProfile(data);
			} else {
				router.push("/profile/create?next=/trivia");
			}
		};
		fetchProfile();
	}, []);

	// Find active session
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (!profile) return;

		const findSession = async () => {
			const { data } = await supabase
				.from("game_session")
				.select("*")
				.in("status", ["lobby", "in_progress"])
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (data) {
				setActiveSession(data);
				if (data.status === "lobby") {
					setGameState("lobby");
					setMessage("Waiting for host to start...");
				} else {
					setGameState("lobby"); // Join as lobby first, wait for next question
					setMessage("Game in progress. Waiting for next question...");
				}

				// Auto join
				if (profile) {
					joinGame(profile.id, profile.name, profile.avatar, data.id).then(setPlayer);
				}
			} else {
				setMessage("No active game found.");
			}
		};
		findSession();

		// Subscribe to new sessions
		const channel = supabase
			.channel("public:game_session")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "game_session" },
				(payload) => {
					if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
						const session = payload.new as GameSession;
						if (session.status === "ended") {
							setActiveSession(null);
							setGameState("searching");
							setMessage("Game ended.");
						} else {
							setActiveSession(session);
							if (session.status === "lobby") {
								setGameState("lobby");
								setMessage("Waiting for host to start...");
							}
						}
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [profile]);

	// Subscribe to game events (questions)
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (!activeSession || !player) return;

		const channel = supabase
			.channel(`game_player:${activeSession.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "session_question",
					filter: `session_id=eq.${activeSession.id}`,
				},
				async (payload) => {
					const sq = payload.new as SessionQuestion;

					// Reset correctness flag when a new question arrives
					setShowCorrectness(false);
					if (correctnessTimeoutRef.current) {
						clearTimeout(correctnessTimeoutRef.current);
						correctnessTimeoutRef.current = null;
					}
					setCurrentSessionQuestionId(sq.id);

					// Fetch question details
					const { data: q } = await supabase
						.from("quiz_question")
						.select("*, question_option(*)")
						.eq("id", sq.question_id)
						.single();

					if (q) {
						setCurrentQuestion(q);
						setGameState("question");
						setSelectedOptionId(null);
						setStartTime(Date.now());
						setTimeLeft(q.time_limit_seconds);
					}
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "session_question",
					filter: `session_id=eq.${activeSession.id}`,
				},
				(payload) => {
					const sq = payload.new as SessionQuestion;
					// Only react to updates for the session question we're currently showing
					if (!currentSessionQuestionId || sq.id !== currentSessionQuestionId) return;
					// If the host marked the session_question as ended, reveal correctness
					if (sq && sq.has_ended) {
						setShowCorrectness(true);
						setMessage("Check the main screen for results!");
						if (correctnessTimeoutRef.current) {
							clearTimeout(correctnessTimeoutRef.current);
						}
						correctnessTimeoutRef.current = window.setTimeout(() => {
							setGameState("results");
							correctnessTimeoutRef.current = null;
						}, 1500);
					}
				},
			)
			.on("broadcast", { event: "show_results" }, () => {
				// First show correctness on the options, then move to the results screen
				setShowCorrectness(true);
				setMessage("Check the main screen for results!");
				// After a short pause show the results screen
				if (correctnessTimeoutRef.current) {
					clearTimeout(correctnessTimeoutRef.current);
				}
				correctnessTimeoutRef.current = window.setTimeout(() => {
					setGameState("results");
					correctnessTimeoutRef.current = null;
				}, 1500);
			})
			.on("broadcast", { event: "show_leaderboard" }, async () => {
				setGameState("leaderboard");
				if (activeSession) {
					const data = await getLeaderboard(activeSession.id);
					setLeaderboard(data);
				}
			})
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
			if (correctnessTimeoutRef.current) {
				clearTimeout(correctnessTimeoutRef.current);
				correctnessTimeoutRef.current = null;
			}
		};
	}, [activeSession, player, currentSessionQuestionId]);

	const handleAnswer = async (optionId: string) => {
		if (!player || !currentSessionQuestionId || selectedOptionId) return;

		setSelectedOptionId(optionId);
		setGameState("answered");
		const responseMs = Date.now() - startTime;

		try {
			await submitAnswer(player.id, currentSessionQuestionId, optionId, responseMs);
		} catch (e) {
			console.error("Error submitting answer", e);
		}
	};

	if (!profile) {
		return <div className="p-8 text-center">Please sign in to play.</div>;
	}

	if (gameState === "searching" || gameState === "lobby") {
		return (
			<div className="flex flex-col items-center justify-center p-6">
				<div className="bg-white p-8 rounded-3xl shadow-xl text-center w-full max-w-md border-b-8 border-emerald-300/20">
					<div className="mb-6">
						<div className="text-6xl mb-4 animate-bounce">🎄</div>
						<h2 className="text-2xl font-black text-slate-800 mb-2">{message}</h2>
					</div>
				</div>
			</div>
		);
	}

	if ((gameState === "question" || gameState === "answered") && currentQuestion) {
		return (
			<div className="flex flex-col p-4">
				<div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full space-y-8">
					{/* Question Prompt */}
					<h2 className="text-2xl md:text-4xl font-black text-center text-slate-800 mb-4">
						{currentQuestion.prompt}
					</h2>

					{/* Timer */}
					{gameState === "question" && (
						<div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center font-black text-xl border-4 border-emerald-500 z-10">
							{timeLeft}
						</div>
					)}

					<div className="grid grid-cols-2 gap-4 md:gap-6">
						{shuffledOptions.map((opt) => {
							const isSelected = selectedOptionId === opt.id;
							const isAnswered = Boolean(selectedOptionId) || gameState === "answered";
							const isCorrectOption = currentQuestion?.question_option.some(
								(o) => o.id === opt.id && o.is_correct,
							);

							// Default classes for answered state
							const ringClass =
								isAnswered && isSelected && !showCorrectness
									? "ring-4 ring-offset-2 ring-sky-400 scale-105 z-10 shadow-2xl"
									: "";
							const dimClass =
								isAnswered && !isSelected && !showCorrectness ? "opacity-40 grayscale" : "";

							// When showing correctness, color correct option green and incorrect selected red
							const correctClass =
								showCorrectness && isCorrectOption
									? "ring-4 ring-offset-2 ring-emerald-500 bg-emerald-600/80"
									: "";
							const incorrectClass =
								showCorrectness && isSelected && !isCorrectOption
									? "ring-4 ring-offset-2 ring-red-500 bg-red-600/80"
									: "";

							return (
								<button
									type="button"
									key={opt.id}
									onClick={() => handleAnswer(opt.id)}
									disabled={gameState === "answered" || showCorrectness}
									className={`
										relative w-full p-6 rounded-2xl flex items-center justify-center gap-4 md:gap-6 transition-all shadow-lg text-left
										${opt.color.bg} text-white
										${ringClass}
										${dimClass}
										${correctClass}
										${incorrectClass}
									`}
								>
									<div className="p-1 rounded-xl shrink-0">
										<ShapeIcon shape={opt.shape} className="w-8 h-8 md:w-10 md:h-10" />
									</div>
									<span
										className={`text-xl hidden md:block md:text-2xl font-bold ${dimClass ? "opacity-70" : ""}`}
									>
										{opt.title}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	if (gameState === "results" && currentQuestion) {
		const isCorrect =
			selectedOptionId &&
			currentQuestion.question_option.find((o) => o.id === selectedOptionId)?.is_correct;
		const correctOption = currentQuestion.question_option.find((o) => o.is_correct);

		return (
			<div className={`flex flex-col items-center justify-center p-6`}>
				<div className="bg-white p-8 rounded-3xl shadow-xl text-center w-full max-w-md border-b-8 border-emerald-300/20">
					<div className="mb-6">
						<div className="text-6xl mb-4">{isCorrect ? "🎉" : "😢"}</div>
						<h2
							className={`text-3xl font-black mb-2 ${
								isCorrect ? "text-green-600" : "text-red-500"
							}`}
						>
							{isCorrect ? "Correct!" : "Incorrect"}
						</h2>
						{!isCorrect && (
							<div className="mt-4 bg-slate-50 p-4 rounded-xl">
								<div className="text-sm text-slate-500 mb-1">Correct Answer:</div>
								<div className="font-bold text-lg text-slate-800">{correctOption?.title}</div>
							</div>
						)}
					</div>
					<div className="text-slate-500 font-medium">Wait for the next question...</div>
				</div>
			</div>
		);
	}

	if (gameState === "leaderboard") {
		return (
			<div className="flex flex-col items-center p-6">
				<div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-b-8 border-emerald-300/20">
					<div className="p-6 bg-emerald-600 text-white text-center">
						<h2 className="text-2xl font-black">Leaderboard</h2>
					</div>
					<div className="p-6 space-y-3">
						{leaderboard.slice(0, 5).map((p, i) => (
							<div
								key={p.id}
								className={`flex items-center gap-3 p-3 rounded-xl ${
									p.id === player?.id
										? "bg-emerald-100 border-2 border-emerald-200"
										: "bg-white border border-slate-100"
								}`}
							>
								<div
									className={`font-bold w-6 ${
										i === 0
											? "text-yellow-500"
											: i === 1
												? "text-slate-400"
												: i === 2
													? "text-amber-600"
													: "text-slate-400"
									}`}
								>
									{i + 1}
								</div>
								<div className="text-2xl">{p.avatar}</div>
								<div className="font-bold flex-1 truncate text-slate-700">{p.name}</div>
								<div className="font-bold text-emerald-600">{p.score}</div>
							</div>
						))}
						{player && !leaderboard.slice(0, 5).find((p) => p.id === player.id) && (
							<div className="mt-4 pt-4 border-t border-slate-200">
								<div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-100 border-2 border-emerald-200">
									<div className="font-bold text-slate-400 w-6">
										{leaderboard.findIndex((p) => p.id === player.id) + 1}
									</div>
									<div className="text-2xl">{player.profile_avatar}</div>
									<div className="font-bold flex-1 truncate text-slate-700">
										{player.profile_name}
									</div>
									<div className="font-bold text-emerald-600">
										{leaderboard.find((p) => p.id === player.id)?.score || 0}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	if (gameState === "answered") {
		// Fallback if currentQuestion is missing for some reason, though unlikely
		return (
			<div className="flex flex-col items-center justify-center p-4">
				<div className="text-3xl font-bold mb-4">Answer Submitted!</div>
				<div className="text-xl text-gray-600">Waiting for results...</div>
			</div>
		);
	}

	return <div>Loading...</div>;
}

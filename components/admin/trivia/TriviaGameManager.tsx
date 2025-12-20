"use client";

import { IconCookieMan } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Database } from "@/types/supabase";
import { registerAudio, unregisterAudio } from "@/utils/audioManager";
import { createBrowserClient } from "@/utils/supabase/clients/browser";
import { getShuffledOptions, ShapeIcon } from "@/utils/trivia/gameUtils";

type Quiz = Database["public"]["Tables"]["quiz"]["Row"];
type GameSession = Database["public"]["Tables"]["game_session"]["Row"];
type TriviaPlayer = Database["public"]["Tables"]["trivia_player"]["Row"];
type QuizQuestion = Database["public"]["Tables"]["quiz_question"]["Row"] & {
	question_option: Database["public"]["Tables"]["question_option"]["Row"][];
};

type Props = {
	quizzes: Quiz[];
	createGameSession(quizId: string): Promise<GameSession>;
	updateGameStatus(sessionId: string, status: "in_progress" | "ended"): Promise<void>;
	startQuestion(sessionId: string, questionId: string): Promise<any>;
	getQuizQuestions(quizId: string): Promise<QuizQuestion[]>;
	getLeaderboard(sessionId: string): Promise<any[]>;
	getAnswerCounts?(sessionQuestionId: string): Promise<Record<string, number>>;
};

export default function TriviaGameManager({
	quizzes,
	createGameSession,
	updateGameStatus,
	startQuestion,
	getQuizQuestions,
	getLeaderboard,
	getAnswerCounts,
}: Props) {
	const [activeSession, setActiveSession] = useState<GameSession | null>(null);
	const [players, setPlayers] = useState<TriviaPlayer[]>([]);
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [loadingQuestions, setLoadingQuestions] = useState(false);
	const [startError, setStartError] = useState<string | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
	const [gameState, setGameState] = useState<
		"idle" | "lobby" | "ready" | "question" | "results" | "leaderboard"
	>("idle");
	const [timer, setTimer] = useState(0);
	const [answersCount, setAnswersCount] = useState(0);
	const timerIntervalRef = useRef<number | null>(null);
	const finishTimeoutRef = useRef<number | null>(null);
	const resultsTimeoutRef = useRef<number | null>(null);
	const leaderboardTimeoutRef = useRef<number | null>(null);
	const currentSessionQuestionIdRef = useRef<string | null>(null);
	const playersCountRef = useRef<number>(0);
	const answeredPlayersRef = useRef<Set<string>>(new Set());
	const isFinishingRef = useRef<boolean>(false);
	const [currentSessionQuestionId, setCurrentSessionQuestionId] = useState<string | null>(null);
	const [optionCounts, setOptionCounts] = useState<Record<string, number>>({});
	const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
	const [showLeaderboardControls, setShowLeaderboardControls] = useState(false);

	const supabase = createBrowserClient();

	// Audio for lobby / waiting
	const waitingAudioRef = useRef<HTMLAudioElement | null>(null);

	// Create and register audio once on mount; unregister on unmount.
	useEffect(() => {
		if (!waitingAudioRef.current) {
			const audio = new Audio("/waiting.mp3");
			audio.loop = true;
			audio.volume = 0.02;
			waitingAudioRef.current = audio;
			registerAudio(audio);
		}

		return () => {
			if (waitingAudioRef.current) {
				waitingAudioRef.current.pause();
				waitingAudioRef.current.currentTime = 0;
				unregisterAudio(waitingAudioRef.current);
				waitingAudioRef.current = null;
			}
		};
	}, []);

	// Helper to attempt to play waiting audio (safe guards)
	const playWaitingAudio = () => {
		try {
			waitingAudioRef.current?.play().catch(() => {});
		} catch (e) {
			// ignore
		}
	};

	// Control play/pause without recreating or unregistering audio to avoid restarts
	// Re-run when players join so playback continues without recreating the element
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		const audio = waitingAudioRef.current;
		if (!audio) return;

		// Play in lobby or when waiting for answers (i.e., during 'lobby' or 'question' before results)
		if (gameState === "lobby") {
			audio.play().catch(() => {
				// Autoplay may be blocked; ignore error
			});
		} else if (gameState === "question") {
			// If we're in a question, play only while answers are still being collected
			// We'll stop when we transition to results/leaderboard
			if (answersCount < (players?.length || 0)) {
				audio.play().catch(() => {});
			} else {
				audio.pause();
				audio.currentTime = 0;
			}
		} else {
			// Stop audio for other states
			audio.pause();
			audio.currentTime = 0;
		}
	}, [gameState, answersCount, players.length]);

	const currentQuestion = questions[currentQuestionIndex];
	const shuffledOptions = useMemo(() => {
		if (!currentQuestion) return [];
		return getShuffledOptions(currentQuestion);
	}, [currentQuestion]);

	// whether we've displayed the last question already
	const isLastQuestion = questions.length > 0 && currentQuestionIndex >= questions.length - 1;

	// Check for existing active session on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		const checkSession = async () => {
			const { data } = await supabase
				.from("game_session")
				.select("*")
				.in("status", ["lobby", "in_progress"])
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (data) {
				setActiveSession(data);
				// If session is currently in_progress, check if any question has been started.
				if (data.status === "lobby") {
					setGameState("lobby");
					playWaitingAudio();
				} else {
					// query latest session_question for this session to determine if first question was started
					const { data: sq } = await supabase
						.from("session_question")
						.select("id")
						.eq("session_id", data.id)
						.order("created_at", { ascending: false })
						.limit(1);
					if (sq && sq.length > 0) {
						setGameState("leaderboard");
					} else {
						// Game was marked in_progress but no question has been started — show lobby so host can start
						setGameState("lobby");
					}
				}
				loadQuestions(data.quiz_id);
				fetchPlayers(data.id);
			}
		};
		checkSession();
	}, []);

	// Subscribe to players and answers
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (!activeSession) return;

		const channel = supabase
			.channel(`game:${activeSession.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "trivia_player",
					filter: `game_id=eq.${activeSession.id}`,
				},
				(payload) => {
					setPlayers((prev) => {
						const newPlayer = payload.new as TriviaPlayer;
						if (prev.some((p) => p.id === newPlayer.id)) return prev;
						return [...prev, newPlayer];
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "player_answer",
				},
				(payload) => {
					const answer = payload.new as any;
					// Only count answers for the current session question
					if (
						answer.session_question_id &&
						answer.session_question_id === currentSessionQuestionIdRef.current
					) {
						// track unique players who have submitted an answer
						if (answer.player_id) answeredPlayersRef.current.add(answer.player_id);
						const uniqueCount = answeredPlayersRef.current.size;
						setAnswersCount(uniqueCount);
						if (playersCountRef.current && uniqueCount >= playersCountRef.current) {
							if (isFinishingRef.current) return;
							console.debug("All players answered (INSERT) — calling handleShowResults", {
								playersCount: playersCountRef.current,
								uniqueCount,
							});
							isFinishingRef.current = true;
							if (timerIntervalRef.current) {
								clearInterval(timerIntervalRef.current);
								timerIntervalRef.current = null;
							}
							handleShowResults();
						}
					}
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "player_answer",
				},
				(payload) => {
					const answer = payload.new as any;
					if (
						!answer.session_question_id ||
						answer.session_question_id !== currentSessionQuestionIdRef.current
					)
						return;
					// track unique player ids who have answered
					if (answer.player_id) answeredPlayersRef.current.add(answer.player_id);
					const uniqueCount = answeredPlayersRef.current.size;
					setAnswersCount(uniqueCount);
					if (playersCountRef.current && uniqueCount >= playersCountRef.current) {
						if (isFinishingRef.current) return;
						console.debug("All players answered (UPDATE) — calling handleShowResults", {
							playersCount: playersCountRef.current,
							uniqueCount,
						});
						isFinishingRef.current = true;
						if (timerIntervalRef.current) {
							clearInterval(timerIntervalRef.current);
							timerIntervalRef.current = null;
						}
						handleShowResults();
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
			answeredPlayersRef.current = new Set();
			currentSessionQuestionIdRef.current = null;
			if (finishTimeoutRef.current) {
				clearTimeout(finishTimeoutRef.current);
				finishTimeoutRef.current = null;
			}
		};
	}, [activeSession]);

	// Keep refs up-to-date for use inside realtime handlers
	useEffect(() => {
		playersCountRef.current = players.length;
	}, [players]);

	useEffect(() => {
		currentSessionQuestionIdRef.current = currentSessionQuestionId;
	}, [currentSessionQuestionId]);

	const loadQuestions = async (quizId: string) => {
		setLoadingQuestions(true);
		try {
			const qs = await getQuizQuestions(quizId);
			setQuestions(qs || []);
			return qs || [];
		} finally {
			setLoadingQuestions(false);
		}
	};

	const fetchPlayers = async (sessionId: string) => {
		const { data } = await supabase.from("trivia_player").select("*").eq("game_id", sessionId);
		if (data) setPlayers(data);
	};

	const handleCreateSession = async (quizId: string) => {
		const session = await createGameSession(quizId);
		// ensure local state reflects lobby status explicitly
		setActiveSession({ ...(session as any), status: "lobby" } as GameSession);
		// reset question state
		setCurrentQuestionIndex(-1);
		setCurrentSessionQuestionId(null);
		setOptionCounts({});
		setLeaderboardData([]);

		setGameState("lobby");
		playWaitingAudio();
		// load questions for this quiz (wait and use returned data)
		await loadQuestions(quizId);
		setPlayers([]);
	};

	const handleStartGame = async () => {
		if (!activeSession) return;
		setStartError(null);
		try {
			// attempt to set session in_progress; server will validate quiz questions exist
			await updateGameStatus(activeSession.id, "in_progress");
			// Start first question immediately
			await handleStartQuestion(activeSession);
		} catch (e: any) {
			console.warn("updateGameStatus failed", e?.message || e);
			setStartError(
				e?.message || "Failed to start game. Ensure the quiz has at least one question.",
			);
			// keep host in lobby so they can inspect/fix
			setGameState("lobby");
			playWaitingAudio();
		}
	};

	const handleStartQuestion = async (sessionParam?: GameSession) => {
		const session = sessionParam || activeSession;
		if (!session) return;
		// Ensure we have questions loaded before starting
		if (questions.length === 0) {
			if (session?.quiz_id) {
				await loadQuestions(session.quiz_id);
			}
			// if still no questions, abort
			if (questions.length === 0) return;
		}

		const nextIndex = currentQuestionIndex + 1;
		if (nextIndex >= questions.length) {
			// End game
			// Log unexpected end condition for debugging if questions exist
			if (questions.length > 0) {
				console.warn("handleStartQuestion: nextIndex >= questions.length — ending game", {
					nextIndex,
					questionsLength: questions.length,
					currentQuestionIndex,
				});
			}
			if (activeSession) await updateGameStatus(activeSession.id, "ended");
			// ensure waiting audio is stopped
			if (waitingAudioRef.current) {
				waitingAudioRef.current.pause();
				waitingAudioRef.current.currentTime = 0;
			}
			setActiveSession(null);
			setGameState("idle");
			return;
		}

		const question = questions[nextIndex];
		setCurrentQuestionIndex(nextIndex);
		setAnswersCount(0);
		// capture current players count for early-finish comparisons
		playersCountRef.current = players.length;

		// Insert session question to trigger players
		const sq = await startQuestion(session.id, question.id);
		// store session_question id so we can fetch per-option counts later
		if (sq?.id) setCurrentSessionQuestionId(sq.id);
		// sync ref and reset answered players set
		currentSessionQuestionIdRef.current = sq?.id || null;
		answeredPlayersRef.current = new Set();
		isFinishingRef.current = false;

		setGameState("question");
		setTimer(question.time_limit_seconds);

		// Start timer and store interval so we can clear it when all players answered
		const interval = window.setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					if (timerIntervalRef.current) {
						clearInterval(timerIntervalRef.current);
						timerIntervalRef.current = null;
					}
					// fallback: ensure finish timeout will also trigger if interval can't
					if (finishTimeoutRef.current) {
						clearTimeout(finishTimeoutRef.current);
						finishTimeoutRef.current = null;
					}
					handleShowResults();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		timerIntervalRef.current = interval;

		// Also schedule a finish timeout as a guard in case intervals are throttled
		if (finishTimeoutRef.current) {
			clearTimeout(finishTimeoutRef.current);
		}
		finishTimeoutRef.current = window.setTimeout(() => {
			if (!isFinishingRef.current) {
				isFinishingRef.current = true;
				console.debug("Finish timeout fired — calling handleShowResults");
				handleShowResults();
			}
		}, question.time_limit_seconds * 1000);
	};

	const handleShowResults = async () => {
		// Stop waiting audio immediately when showing results
		if (waitingAudioRef.current) {
			waitingAudioRef.current.pause();
			waitingAudioRef.current.currentTime = 0;
		}
		console.debug("handleShowResults called", { currentSessionQuestionId, answersCount });
		// clear any running timer interval
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
		}
		if (finishTimeoutRef.current) {
			clearTimeout(finishTimeoutRef.current);
			finishTimeoutRef.current = null;
		}
		setGameState("results");
		// Send broadcast to show results
		await supabase.channel(`game_events:${activeSession?.id}`).send({
			type: "broadcast",
			event: "show_results",
			payload: {},
		});

		// Resolve session question id (use stored or query latest)
		let sqId = currentSessionQuestionId;
		if (!sqId && activeSession?.id) {
			const { data: latest } = await supabase
				.from("session_question")
				.select("id")
				.eq("session_id", activeSession.id)
				.order("created_at", { ascending: false })
				.limit(1);
			if (latest && latest.length > 0) sqId = latest[0].id;
		}

		if (sqId) {
			// helper to get counts from server action or client fallback
			const fetchCountsOnce = async () => {
				if (getAnswerCounts) {
					return (await getAnswerCounts(sqId)) || {};
				}
				const { data: answers } = await supabase
					.from("player_answer")
					.select("option_id")
					.eq("session_question_id", sqId);
				const counts: Record<string, number> = {};
				if (answers && Array.isArray(answers)) {
					for (const a of answers) {
						const opt = (a as any).option_id;
						if (!opt) continue;
						counts[opt] = (counts[opt] || 0) + 1;
					}
				}
				return counts;
			};

			// Retry a few times if there are no counts yet but we observed answersCount > 0
			let counts: Record<string, number> = {};
			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					counts = await fetchCountsOnce();
					const total = Object.values(counts).reduce((s, v) => s + (v || 0), 0);
					if (total > 0 || attempt === 2) {
						setOptionCounts(counts);
						break;
					}
					// otherwise wait a moment and retry
					await new Promise((r) => setTimeout(r, 500));
				} catch (e) {
					console.error("fetchCountsOnce failed", e);
					if (attempt === 2) setOptionCounts({});
				}
			}

			// Mark this session_question as ended so players/clients can rely on this flag
			try {
				const { error: updateError } = await supabase
					.from("session_question")
					.update({ has_ended: true })
					.eq("id", sqId);
				if (updateError) {
					console.error("Failed to mark session_question.has_ended", updateError);
				}
			} catch (err) {
				console.error("Error updating session_question.has_ended", err);
			}
		}
	};

	// Auto-advance from Results after 5 seconds to Leaderboard
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (gameState !== "results") {
			if (resultsTimeoutRef.current) {
				clearTimeout(resultsTimeoutRef.current);
				resultsTimeoutRef.current = null;
			}
			return;
		}

		if (resultsTimeoutRef.current) {
			clearTimeout(resultsTimeoutRef.current);
		}

		resultsTimeoutRef.current = window.setTimeout(() => {
			resultsTimeoutRef.current = null;
			handleNext();
		}, 5000);

		return () => {
			if (resultsTimeoutRef.current) {
				clearTimeout(resultsTimeoutRef.current);
				resultsTimeoutRef.current = null;
			}
		};
	}, [gameState]);

	// Leaderboard: either auto-advance after 5s to next question, or if last question,
	// reveal the End Game button after 5s.
	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (gameState !== "leaderboard") {
			if (leaderboardTimeoutRef.current) {
				clearTimeout(leaderboardTimeoutRef.current);
				leaderboardTimeoutRef.current = null;
			}
			setShowLeaderboardControls(false);
			return;
		}

		setShowLeaderboardControls(false);
		if (leaderboardTimeoutRef.current) {
			clearTimeout(leaderboardTimeoutRef.current);
		}

		if (!isLastQuestion) {
			leaderboardTimeoutRef.current = window.setTimeout(() => {
				leaderboardTimeoutRef.current = null;
				handleStartQuestion();
			}, 5000);
		} else {
			// Last leaderboard: reveal End Game button after 5s
			leaderboardTimeoutRef.current = window.setTimeout(() => {
				leaderboardTimeoutRef.current = null;
				setShowLeaderboardControls(true);
			}, 5000);
		}

		return () => {
			if (leaderboardTimeoutRef.current) {
				clearTimeout(leaderboardTimeoutRef.current);
				leaderboardTimeoutRef.current = null;
			}
		};
	}, [gameState, isLastQuestion]);

	const handleNext = async () => {
		if (!activeSession) return;

		// Fetch leaderboard
		const newLeaderboard = await getLeaderboard(activeSession.id);

		// Calculate rank changes
		const updatedLeaderboard = newLeaderboard.map((player, index) => {
			const prevData = leaderboardData.find((p) => p.id === player.id);
			const prevRank = prevData ? leaderboardData.indexOf(prevData) : index;
			const change = prevRank - index; // Positive means moved up (e.g. 5 -> 1 is +4)

			return {
				...player,
				rank: index + 1,
				change,
			};
		});

		setLeaderboardData(updatedLeaderboard);
		setGameState("leaderboard");

		// Broadcast show_leaderboard event
		await supabase.channel(`game_events:${activeSession.id}`).send({
			type: "broadcast",
			event: "show_leaderboard",
			payload: {},
		});
	};

	if (!activeSession) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
				<div className="text-center mb-12">
					<h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">Trivia Host</h1>
					<p className="text-xl text-slate-500">Select a quiz to launch a new game session</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl">
					{quizzes.map((quiz) => (
						<div
							key={quiz.id}
							className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-slate-100 hover:border-emerald-500 overflow-hidden"
						>
							<div className="p-8">
								<h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">
									{quiz.title}
								</h3>
								<p className="text-slate-500 mb-8 line-clamp-2">{quiz.description}</p>
								<button
									type="button"
									className="w-full py-3 px-6 bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white rounded-xl font-bold transition-all duration-200"
									onClick={() => handleCreateSession(quiz.id)}
								>
									Start Session
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (gameState === "lobby") {
		return (
			<div className="min-h-screen flex flex-col items-center pt-20 px-4">
				<div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-4xl w-full mb-12 border-b-8 border-emerald-300/20">
					<h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
						<span>Waiting for Players</span>
						<span className="animated-ellipsis" aria-hidden>
							<span className="dot">.</span>
							<span className="dot">.</span>
							<span className="dot">.</span>
						</span>
					</h2>

					<div className="flex items-center justify-center gap-4 mb-8">
						<div
							key={players.length}
							className="px-6 py-2 bg-slate-100 rounded-full text-slate-600 font-bold bounce-on-change"
						>
							{players.length} joined
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8 text-left">
						{players.map((p, i) => (
							<div
								key={p.id}
								className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 player-card"
								style={{ animationDelay: `${i * 70}ms` }}
							>
								<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
									{p.profile_avatar}
								</div>
								<div className="font-bold text-slate-700 truncate">{p.profile_name}</div>
							</div>
						))}
					</div>

					<button
						type="button"
						onClick={handleStartGame}
						disabled={players.length === 0}
						className="px-12 py-4 bg-emerald-600 text-white text-2xl font-bold rounded-2xl hover:bg-emerald-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-200"
					>
						Start Game
					</button>
					{startError && (
						<div className="mt-4 text-sm text-red-600 font-semibold">{startError}</div>
					)}
				</div>
			</div>
		);
	}

	// Removed explicit 'ready' state UI — host will start first question directly from lobby.

	// Safety: if somehow we're in leaderboard state but no question has been started,
	// show a simple start button to begin the first question.
	if (gameState === "leaderboard" && currentQuestionIndex < 0) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-8">
				<div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-3xl w-full mb-8">
					<h2 className="text-3xl font-bold text-slate-800 mb-4">Game Ready</h2>
					<p className="text-slate-500 mb-8">Start the first question when ready.</p>
					<div className="flex items-center justify-center gap-4">
						<div
							key={players.length}
							className="px-6 py-3 bg-slate-100 rounded-full text-slate-700 font-semibold bounce-on-change"
						>
							{players.length} players
						</div>
						<button
							type="button"
							onClick={() => handleStartQuestion(activeSession)}
							className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700"
						>
							Start First Question
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			{gameState === "question" && currentQuestion && (
				<div className="max-w-5xl mx-auto space-y-12 relative">
					<div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center font-black text-2xl border-4 border-emerald-500 z-10">
						{timer}
					</div>
					<div className="text-center space-y-8 pt-8">
						<h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
							{currentQuestion.prompt}
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{shuffledOptions.map((opt) => (
							<div
								key={opt.id}
								className={`p-8 rounded-2xl text-2xl text-white shadow-lg transform transition-transform ${opt.color.bg} flex items-center gap-6`}
							>
								<div className="bg-black/20 p-3 rounded-xl">
									<ShapeIcon shape={opt.shape} className="w-8 h-8" />
								</div>
								<span className="font-bold">{opt.title}</span>
							</div>
						))}
					</div>
					<div className="flex justify-center pt-8">
						<button
							type="button"
							onClick={handleShowResults}
							className="text-slate-400 hover:text-red-500 font-semibold transition-colors"
						>
							End Question Early
						</button>
					</div>
				</div>
			)}

			{gameState === "results" && currentQuestion && (
				<div className="max-w-5xl mx-auto space-y-12">
					<h2 className="mt-4 text-4xl text-center md:text-5xl font-bold text-slate-800 leading-tight">
						{currentQuestion.prompt}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{shuffledOptions.map((opt) => (
							<div
								key={opt.id}
								className={`p-8 rounded-2xl text-2xl flex items-center gap-6 transition-all duration-500 ${
									opt.is_correct
										? `${opt.color.bg} text-white shadow-xl scale-105 ring-4 ring-offset-4 ring-green-400`
										: "bg-slate-100 text-slate-400 opacity-50"
								}`}
							>
								<div
									className={`p-3 rounded-xl ${opt.is_correct ? "bg-black/20" : "bg-slate-200"}`}
								>
									<ShapeIcon shape={opt.shape} className="w-8 h-8" />
								</div>
								<div className="flex-1">
									<div className="font-bold">{opt.title}</div>
									<div className="text-sm text-slate-500 mt-1">
										{Array.from({ length: Math.min(optionCounts[opt.id], 10) }).map((_, i) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: <>
											<div key={i} className="w-6 h-6 text-slate-500">
												<IconCookieMan className="w-6 h-6 text-current text-white" stroke={1.2} />
											</div>
										))}
										{optionCounts[opt.id] > 10 && (
											<div className="ml-1 text-sm text-slate-500 font-medium">
												+{optionCounts[opt.id] - 10}
											</div>
										)}
									</div>
								</div>
								{opt.is_correct && (
									<div className="bg-white text-green-600 p-2 rounded-full shadow-sm">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<title>Correct Answer</title>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								)}
							</div>
						))}
					</div>
					<div className="flex justify-center pt-8">
						{/* Auto-advances to leaderboard after 5s; no manual Next button */}
					</div>
				</div>
			)}

			{gameState === "leaderboard" && (
				<div className="max-w-4xl mx-auto space-y-8">
					<h2 className="text-4xl font-black text-center text-slate-800 mb-12">Leaderboard</h2>

					<div
						className="relative"
						style={{ height: `${Math.max(leaderboardData.length * 88, 200)}px` }}
					>
						{leaderboardData.map((player, index) => (
							<div
								key={player.id}
								className="absolute mt-2 w-full transition-all duration-700 ease-in-out"
								style={{
									top: `${index * 88}px`,
									zIndex: leaderboardData.length - index,
								}}
							>
								<div
									className={`flex items-center gap-6 p-6 rounded-2xl shadow-sm border-2 ${
										index < 3 ? "border-yellow-400 bg-yellow-50" : "border-slate-100 bg-white"
									}`}
								>
									<div
										className={`text-3xl font-black w-12 ${
											index < 3 ? "text-yellow-600" : "text-slate-300"
										}`}
									>
										#{index + 1}
									</div>
									<div className="flex-1 flex items-center gap-4">
										<div className="text-4xl bg-white p-2 rounded-full shadow-sm">
											{player.avatar}
										</div>
										<div className="font-bold text-2xl text-slate-700">{player.name}</div>
									</div>
									<div className="flex items-center gap-6">
										<div className="text-2xl font-bold text-emerald-600 bg-emerald-50 px-4 py-1 rounded-lg">
											{player.score} <span className="text-sm text-emerald-400 uppercase">pts</span>
										</div>
										<div className="w-12 flex justify-center">
											{player.change > 0 && (
												<span className="text-green-500 font-bold flex items-center text-lg">
													▲ {player.change}
												</span>
											)}
											{player.change < 0 && (
												<span className="text-red-400 font-bold flex items-center text-lg">
													▼ {Math.abs(player.change)}
												</span>
											)}
											{player.change === 0 && <span className="text-slate-200 font-bold">-</span>}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="text-center pt-12">
						{showLeaderboardControls ? (
							// Show End Game or Next Question button after delay
							<button
								type="button"
								onClick={async () => {
									if (isLastQuestion) {
										// End the game
										if (!activeSession) return;
										await updateGameStatus(activeSession.id, "ended");
										setActiveSession(null);
										setGameState("idle");
										return;
									}
									handleStartQuestion();
								}}
								className={`px-12 py-5 text-white rounded-2xl text-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all ${
									isLastQuestion
										? "bg-slate-800 hover:bg-black"
										: "bg-emerald-600 hover:bg-emerald-700"
								}`}
							>
								{currentQuestionIndex === -1
									? "Start First Question"
									: isLastQuestion
										? "End Game"
										: "Next Question"}
							</button>
						) : (
							// Waiting state shown while auto-advance will occur
							<div className="text-sm text-slate-500">Advancing shortly...</div>
						)}
					</div>
				</div>
			)}
			{/* Persistent small End Game text button fixed at bottom center */}
			{activeSession && (
				<button
					type="button"
					onClick={async () => {
						if (!activeSession) return;
						await updateGameStatus(activeSession.id, "ended");
						setActiveSession(null);
						setGameState("idle");
					}}
					className="mt-10 opacity-20 text-sm text-red-500 hover:text-red-700 font-semibold"
				>
					End Game
				</button>
			)}
		</div>
	);
}

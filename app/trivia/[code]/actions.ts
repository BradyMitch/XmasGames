"use server";

import { createServerClient } from "@/utils/supabase/clients/server";

export async function joinGame(
	profileId: number,
	profileName: string,
	profileAvatar: string,
	gameId: string,
) {
	const supabase = await createServerClient();

	// Check if already joined
	const { data: existing } = await supabase
		.from("trivia_player")
		.select("*")
		.eq("profile_id", profileId)
		.eq("game_id", gameId)
		.single();

	if (existing) return existing;

	const { data, error } = await supabase
		.from("trivia_player")
		.insert({
			profile_id: profileId,
			profile_name: profileName,
			profile_avatar: profileAvatar,
			game_id: gameId,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function submitAnswer(
	playerId: string,
	sessionQuestionId: string,
	optionId: string,
	responseMs: number,
) {
	const supabase = await createServerClient();

	// Check if correct
	const { data: option } = await supabase
		.from("question_option")
		.select("is_correct, question_id")
		.eq("id", optionId)
		.single();

	if (!option) throw new Error("Option not found");

	// Get question points
	const { data: question } = await supabase
		.from("quiz_question")
		.select("points, time_limit_seconds")
		.eq("id", option.question_id)
		.single();

	// base points for correctness
	const basePoints = option.is_correct ? question?.points || 0 : 0;

	// calculate time bonus: 10 points per second remaining
	let timeBonus = 0;
	if (option.is_correct && question?.time_limit_seconds) {
		const timeLimitMs = (question.time_limit_seconds || 0) * 1000;
		const msLeft = Math.max(0, timeLimitMs - (responseMs || 0));
		const secondsLeft = Math.ceil(msLeft / 1000);
		timeBonus = 10 * secondsLeft;
	}

	const points = basePoints + timeBonus;

	const { data, error } = await supabase
		.from("player_answer")
		.insert({
			player_id: playerId,
			session_question_id: sessionQuestionId,
			option_id: optionId,
			response_ms: responseMs,
			is_correct: option.is_correct,
			points_awarded: points,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function getLeaderboard(sessionId: string) {
	const supabase = await createServerClient();

	// Fetch players and their answers
	const { data: players, error } = await supabase
		.from("trivia_player")
		.select(`
			id,
			profile_name,
			profile_avatar,
			player_answer (
				points_awarded
			)
		`)
		.eq("game_id", sessionId);

	if (error) throw error;

	// Calculate scores
	const leaderboard = players.map((player: any) => {
		const totalScore =
			player.player_answer?.reduce((sum: number, ans: any) => sum + (ans.points_awarded || 0), 0) ||
			0;
		return {
			id: player.id,
			name: player.profile_name,
			avatar: player.profile_avatar,
			score: totalScore,
		};
	});

	// Sort by score descending
	leaderboard.sort((a: any, b: any) => b.score - a.score);

	return leaderboard;
}

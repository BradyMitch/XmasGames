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
		.select("points")
		.eq("id", option.question_id)
		.single();

	const points = option.is_correct ? question?.points || 0 : 0;

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

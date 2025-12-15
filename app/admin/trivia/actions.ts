"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/utils/supabase/clients/server";

export async function createGameSession(quizId: string) {
	const supabase = await createServerClient();
	const { data, error } = await supabase
		.from("game_session")
		.insert({
			quiz_id: quizId,
			status: "lobby",
			started_at: null,
		})
		.select()
		.single();

	if (error) throw error;
	revalidatePath("/admin/trivia");
	return data;
}

export async function updateGameStatus(sessionId: string, status: "in_progress" | "ended") {
	const supabase = await createServerClient();
	// Validate before applying status changes
	const updates: any = { status };
	if (status === "in_progress") {
		// Ensure the session's quiz actually has questions
		const { data: session, error: sessErr } = await supabase
			.from("game_session")
			.select("quiz_id")
			.eq("id", sessionId)
			.single();
		if (sessErr) throw sessErr;
		const quizId = session?.quiz_id;
		if (!quizId) throw new Error("Cannot start game: no quiz assigned to session.");
		const { data: questions } = await supabase
			.from("quiz_question")
			.select("id")
			.eq("quiz_id", quizId)
			.limit(1);
		if (!questions || questions.length === 0) {
			throw new Error("Cannot start game: quiz has no questions.");
		}
		updates.started_at = new Date().toISOString();
	}
	if (status === "ended") updates.ended_at = new Date().toISOString();

	const { error } = await supabase.from("game_session").update(updates).eq("id", sessionId);

	if (error) throw error;
	revalidatePath("/admin/trivia");
}

export async function startQuestion(sessionId: string, questionId: string) {
	const supabase = await createServerClient();
	const { data, error } = await supabase
		.from("session_question")
		.insert({
			session_id: sessionId,
			question_id: questionId,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function getQuizQuestions(quizId: string) {
	const supabase = await createServerClient();
	const { data, error } = await supabase
		.from("quiz_question")
		.select("*, question_option(*)")
		.eq("quiz_id", quizId)
		.order("order", { ascending: true });

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

export async function getAnswerCounts(sessionQuestionId: string) {
	const supabase = await createServerClient();

	const { data: answers, error } = await supabase
		.from("player_answer")
		.select("option_id")
		.eq("session_question_id", sessionQuestionId);

	if (error) throw error;

	const counts: Record<string, number> = {};
	if (answers && Array.isArray(answers)) {
		for (const a of answers) {
			const opt = (a as any).option_id;
			if (!opt) continue;
			counts[opt] = (counts[opt] || 0) + 1;
		}
	}

	return counts;
}

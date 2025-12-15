/**
 * Use the upsert-supabase-type prompt to update types:
 * @prompt upsert-supabase-type <table name|view name|function name|enum name>
 */

import type { QuestionType } from "./enums/QuestionType";
import type { TriviaGameStatus } from "./enums/TriviaGameStatus";
import type { Broadcast } from "./tables/Broadcast";
import type { Code } from "./tables/Code";
import type { DraftBroadcast } from "./tables/DraftBroadcast";
import type { Draw } from "./tables/Draw";
import type { GameSession } from "./tables/GameSession";
import type { InstantWin } from "./tables/InstantWin";
import type { PlayerAnswer } from "./tables/PlayerAnswer";
import type { Profile } from "./tables/Profile";
import type { QuestionOption } from "./tables/QuestionOption";
import type { Quiz } from "./tables/Quiz";
import type { QuizQuestion } from "./tables/QuizQuestion";
import type { SessionQuestion } from "./tables/SessionQuestion";
import type { TriviaPlayer } from "./tables/TriviaPlayer";

// biome-ignore lint/complexity/noBannedTypes: Placeholder for future views
type Views = {};

type Tables = {
	broadcast: Broadcast;
	code: Code;
	draw: Draw;
	draft_broadcast: DraftBroadcast;
	game_session: GameSession;
	instant_win: InstantWin;
	player_answer: PlayerAnswer;
	profile: Profile;
	quiz: Quiz;
	quiz_question: QuizQuestion;
	question_option: QuestionOption;
	session_question: SessionQuestion;
	trivia_player: TriviaPlayer;
};

// biome-ignore lint/complexity/noBannedTypes: Placeholder for future functions
type Functions = {};

type Enums = {
	QuestionType: QuestionType;
	TriviaGameStatus: TriviaGameStatus;
};

export type Database = {
	__InternalSupabase: {
		PostgrestVersion: "13.0.5";
	};
	public: {
		Tables: Tables;
		Views: Views;
		Functions: Functions;
		Enums: Enums;
	};
};

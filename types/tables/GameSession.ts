import type { TriviaGameStatus } from "../enums/TriviaGameStatus";
import type { Table } from "../supabase-helpers";

export type GameSession = Table<
	{
		quiz_id: string;
		status: TriviaGameStatus;
		started_at: string | null;
		ended_at: string | null;
	},
	[
		{
			foreignKeyName: "game_session_quiz_id_fkey";
			columns: ["quiz_id"];
			isOneToOne: false;
			referencedRelation: "quiz";
			referencedColumns: ["id"];
		},
	],
	string
>;

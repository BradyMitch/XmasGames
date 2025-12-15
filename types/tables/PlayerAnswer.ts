import type { Table } from "../supabase-helpers";

export type PlayerAnswer = Table<
	{
		player_id: string;
		option_id: string;
		session_question_id: string;
		response_ms: number;
		is_correct: boolean;
		points_awarded: number;
	},
	[
		{
			foreignKeyName: "player_answer_player_id_fkey";
			columns: ["player_id"];
			isOneToOne: false;
			referencedRelation: "trivia_player";
			referencedColumns: ["id"];
		},
		{
			foreignKeyName: "player_answer_option_id_fkey";
			columns: ["option_id"];
			isOneToOne: false;
			referencedRelation: "question_option";
			referencedColumns: ["id"];
		},
		{
			foreignKeyName: "player_answer_session_question_id_fkey";
			columns: ["session_question_id"];
			isOneToOne: false;
			referencedRelation: "session_question";
			referencedColumns: ["id"];
		},
	],
	string
>;

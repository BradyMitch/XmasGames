import type { Table } from "../supabase-helpers";

export type SessionQuestion = Table<
	{
		session_id: string;
		question_id: string;
		has_ended: boolean;
	},
	[
		{
			foreignKeyName: "session_question_session_id_fkey";
			columns: ["session_id"];
			isOneToOne: false;
			referencedRelation: "game_session";
			referencedColumns: ["id"];
		},
		{
			foreignKeyName: "session_question_question_id_fkey";
			columns: ["question_id"];
			isOneToOne: false;
			referencedRelation: "quiz_question";
			referencedColumns: ["id"];
		},
	],
	string
>;

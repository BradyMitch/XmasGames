import type { Table } from "../supabase-helpers";

export type QuestionOption = Table<
	{
		question_id: string;
		title: string;
		is_correct: boolean;
	},
	[
		{
			foreignKeyName: "question_option_question_id_fkey";
			columns: ["question_id"];
			isOneToOne: false;
			referencedRelation: "quiz_question";
			referencedColumns: ["id"];
		},
	],
	string
>;

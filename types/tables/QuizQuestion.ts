import type { QuestionType } from "../enums/QuestionType";
import type { Table } from "../supabase-helpers";

export type QuizQuestion = Table<
	{
		quiz_id: string;
		kind: QuestionType;
		prompt: string;
		explanation: string | null;
		order: number;
		time_limit_seconds: number;
		points: number;
	},
	[
		{
			foreignKeyName: "quiz_question_quiz_id_fkey";
			columns: ["quiz_id"];
			isOneToOne: false;
			referencedRelation: "quiz";
			referencedColumns: ["id"];
		},
	],
	string
>;

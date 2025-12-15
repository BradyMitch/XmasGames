import type { Table } from "../supabase-helpers";

export type Quiz = Table<
	{
		title: string;
		description: string;
	},
	[],
	string
>;

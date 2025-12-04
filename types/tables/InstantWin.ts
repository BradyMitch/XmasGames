import type { Table } from "@/types/supabase-helpers";

export type InstantWin = Table<
	{
		name: string;
		value: number | null;
		weight: number;
		won: boolean;
		won_by_id: number | null;
		won_by_name: string | null;
	},
	[],
	string
>;

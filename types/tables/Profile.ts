import type { Table } from "@/types/supabase-helpers";

export type Profile = Table<{
	name: string;
	avatar: string;
	spins: number;
	tickets: number;
	code: string;
}>;

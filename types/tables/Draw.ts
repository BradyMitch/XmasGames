import type { Table } from "@/types/supabase-helpers";

export type Draw = Table<{
	profile_id: number;
	name: string;
	tickets: number;
}>;

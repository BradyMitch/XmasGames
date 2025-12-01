import type { Table } from "@/types/supabase-helpers";

export type Broadcast = Table<{
	text: string;
	duration: number;
}>;

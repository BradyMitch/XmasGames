import type { Table } from "@/types/supabase-helpers";

export type Code = Table<{
	code: string;
	spins: number;
	redeemed: boolean;
	redeemed_by_id: string | null;
	redeemed_by_name: string | null;
}>;

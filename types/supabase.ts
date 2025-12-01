/**
 * Download new table, view, function, and enum types from Supabase.
 * API Docs > Tables And Views > Introduction > Generate and download types
 *
 * Use the upsert-supabase-type prompt to update types:
 * @prompt upsert-supabase-type
 */

import type { Broadcast } from "./tables/Broadcast";
import type { Code } from "./tables/Code";
import type { DraftBroadcast } from "./tables/DraftBroadcast";
import type { Profile } from "./tables/Profile";

// biome-ignore lint/complexity/noBannedTypes: Placeholder for future views
type Views = {};

type Tables = {
	broadcast: Broadcast;
	code: Code;
	draft_broadcast: DraftBroadcast;
	profile: Profile;
};

// biome-ignore lint/complexity/noBannedTypes: Placeholder for future functions
type Functions = {};

// biome-ignore lint/complexity/noBannedTypes: Placeholder for future enums
type Enums = {};

export type Database = {
	__InternalSupabase: {
		PostgrestVersion: "13.0.5";
	};
	public: {
		Tables: Tables;
		Views: Views;
		Functions: Functions;
		Enums: Enums;
	};
};

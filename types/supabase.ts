/**
 * Use the upsert-supabase-type prompt to update types:
 * @prompt upsert-supabase-type <table name|view name|function name|enum name>
 */

import type { Broadcast } from "./tables/Broadcast";
import type { Code } from "./tables/Code";
import type { DraftBroadcast } from "./tables/DraftBroadcast";
import type { Draw } from "./tables/Draw";
import type { InstantWin } from "./tables/InstantWin";
import type { Profile } from "./tables/Profile";

// biome-ignore lint/complexity/noBannedTypes: Placeholder for future views
type Views = {};

type Tables = {
	broadcast: Broadcast;
	code: Code;
	draw: Draw;
	draft_broadcast: DraftBroadcast;
	instant_win: InstantWin;
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

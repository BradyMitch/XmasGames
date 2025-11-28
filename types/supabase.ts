
/**
 * Download new table, view, function, and enum types from Supabase.
 * API Docs > Tables And Views > Introduction > Generate and download types
 *
 * Use the upsert-supabase-type prompt to update types:
 * @prompt upsert-supabase-type
 */

type Views = {
};

type Tables = {
};

type Functions = {
};

type Enums = {
};

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

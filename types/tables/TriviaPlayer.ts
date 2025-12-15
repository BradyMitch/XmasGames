import type { Table } from "../supabase-helpers";

export type TriviaPlayer = Table<
	{
		profile_id: number;
		profile_name: string;
		profile_avatar: string;
		game_id: string;
	},
	[
		{
			foreignKeyName: "trivia_player_profile_id_fkey";
			columns: ["profile_id"];
			isOneToOne: false;
			referencedRelation: "profile";
			referencedColumns: ["id"];
		},
		{
			foreignKeyName: "trivia_player_game_id_fkey";
			columns: ["game_id"];
			isOneToOne: false;
			referencedRelation: "game_session";
			referencedColumns: ["id"];
		},
	],
	string
>;

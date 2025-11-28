import { createServerClient } from "../clients/server";

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
	"use server";
	const supabase = await createServerClient();

	const { data, error } = await supabase.rpc("is_profile_username_available", {
		p_username: username,
		p_exclude_id: null,
	});

	if (error) console.error("Error checking username availability:", error);

	return data ?? false;
};

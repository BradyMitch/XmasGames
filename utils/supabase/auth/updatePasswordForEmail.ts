import type { User } from "@supabase/supabase-js";
import { createServerClient } from "../clients/server";

export const updatePasswordForEmail = async (newPassword: string): Promise<User | null> => {
	"use server";
	const supabase = await createServerClient();

	const { data, error } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (error) throw new Error(error.message);

	return data?.user;
};

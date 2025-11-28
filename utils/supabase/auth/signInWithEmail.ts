import type { User } from "@supabase/supabase-js";
import { createServerClient } from "../clients/server";

export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
	"use server";
	const supabase = await createServerClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw new Error(error.message);

	return data.user;
};

import type { User } from "@supabase/supabase-js";
import { createServerClient } from "../clients/server";
import { getURL } from "../getURL";

export const emailSignUp = async (
	email: string,
	password: string,
	redirect: string = `${getURL()}/auth/sign-in?email=${encodeURIComponent(email)}`,
): Promise<User | null> => {
	"use server";
	const supabase = await createServerClient();

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: redirect,
		},
	});

	if (error) throw new Error(error.message);

	return data?.user;
};

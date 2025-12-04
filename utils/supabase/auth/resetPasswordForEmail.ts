import { createServerClient } from "../clients/server";
import { getURL } from "../getURL";

export const resetPasswordForEmail = async (email: string): Promise<void> => {
	"use server";
	const supabase = await createServerClient();

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${getURL()}/auth/reset-password`,
	});

	if (error) throw new Error(error.message);

	return;
};

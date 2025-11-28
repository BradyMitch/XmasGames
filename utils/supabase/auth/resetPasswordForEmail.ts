import { getURL } from "next/dist/shared/lib/utils";
import { createServerClient } from "../clients/server";

export const resetPasswordForEmail = async (email: string): Promise<void> => {
	"use server";
	const supabase = await createServerClient();

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${getURL()}/auth/reset-password`,
	});

	if (error) throw new Error(error.message);

	return;
};

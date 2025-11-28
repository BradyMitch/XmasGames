"use server";

import type { JwtPayload } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerClient } from "../clients/server";

export const initializeServerComponent = async (
	is_private: boolean = false,
): Promise<{
	supabase: Awaited<ReturnType<typeof createServerClient>>;
	jwt: JwtPayload | null;
}> => {
	const supabase = await createServerClient();

	const { data } = await supabase.auth.getClaims();

	if (is_private && !data?.claims) redirect("/auth/sign-in");

	return {
		supabase,
		jwt: data?.claims || null,
	};
};

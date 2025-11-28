import "server-only";

import type { SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";
import { createClient as createJsClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const createAdminClient = (
	options?: SupabaseClientOptions<"public">,
): SupabaseClient<Database> => {
	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
	}

	return createJsClient<Database>(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false,
		},
		...options,
	});
};

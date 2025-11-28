import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

export type MiddlewareSupabase = {
	supabase: SupabaseClient<Database>;
	response: NextResponse;
};

export const createMiddlewareClient = (request: NextRequest): MiddlewareSupabase => {
	if (!supabaseUrl || !supabasePublishableKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
	}

	let response = NextResponse.next({ request });

	const supabase = createSSRServerClient<Database>(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				// 1) Update the request cookies
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}
				// 2) Rebuild the response bound to the updated request
				response = NextResponse.next({ request });
				// 3) Mirror the cookies to the response (what the browser receives)
				for (const { name, value, options } of cookiesToSet) {
					response.cookies.set(name, value, options);
				}
			},
		},
	});

	return { supabase, response };
};

import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/auth/updateSession";
import { createMiddlewareClient } from "./utils/supabase/clients/middleware";

export default async function proxy(request: NextRequest) {
	const { supabase } = createMiddlewareClient(request);

	const { data } = await supabase.auth.getClaims();
	const user_id = data?.claims?.sub || null;

	// Update user activity
	if (user_id) {
		const { error } = await supabase.rpc("update_user_activity", {
			p_user_id: user_id,
		});

		if (error) console.error("Error updating user activity:", error);
	}

	// Update variety views if applicable
	const url = new URL(request.url);
	if (url.pathname.startsWith("/varieties/")) {
		const slug = url.pathname.split("/varieties/")[1].split("/")[0];

		const { error } = await supabase.rpc("increment_variety_views_by_slug", {
			p_slug: slug,
		});

		if (error) console.error("Error incrementing variety views:", error);
	}

	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes - handled separately)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, robots.txt, sitemap.xml (static files)
		 * - file extensions for static assets
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.js|.*\\.css|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.eot).*)",
	],
};

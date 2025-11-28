import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/utils/supabase/clients/middleware";

const isPrivatePath = (pathname: string): boolean => {
	return (
		pathname.startsWith("/profile") ||
		pathname.startsWith("/account") ||
		pathname.startsWith("/auth/update-password")
	);
};

export const updateSession = async (request: NextRequest): Promise<NextResponse> => {
	const { supabase, response } = createMiddlewareClient(request);

	// Trigger refresh & cookie sync immediately
	const { data } = await supabase.auth.getClaims();

	if (!data?.claims && isPrivatePath(request.nextUrl.pathname)) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth/sign-in";

		// Attach redirect query param for post-login return
		const redirectPath = request.nextUrl.pathname + request.nextUrl.search;
		url.searchParams.set("redirect", redirectPath);

		const redirect = NextResponse.redirect(url);
		return redirect;
	}

	return response;
};

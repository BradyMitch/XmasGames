import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";
import { signInWithEmail } from "@/utils/supabase/auth/signInWithEmail";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to your World of Citrus account.",
	alternates: { canonical: "/auth/sign-in" },
	openGraph: { url: "/auth/sign-in" },
};

export default async function Page({ searchParams }: PageProps<"/auth/sign-in">) {
	const { email, redirect } = await searchParams;

	return (
		<div className="flex items-center justify-center bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
			<SignInForm
				signInWithEmail={signInWithEmail}
				initialEmail={typeof email === "string" ? email : undefined}
				redirectUrl={typeof redirect === "string" ? redirect : undefined}
			/>
		</div>
	);
}

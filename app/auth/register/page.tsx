import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { emailSignUp } from "@/utils/supabase/auth/emailSignUp";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Create a new World of Citrus account.",
	alternates: { canonical: "/auth/register" },
	openGraph: { url: "/auth/register" },
};

export default async function Page({ searchParams }: PageProps<"/auth/register">) {
	const { email } = await searchParams;

	return (
		<div className="flex items-center justify-center bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
			<SignUpForm
				emailSignUp={emailSignUp}
				initialEmail={typeof email === "string" ? email : undefined}
			/>
		</div>
	);
}

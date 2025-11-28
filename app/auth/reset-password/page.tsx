import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { resetPasswordForEmail } from "@/utils/supabase/auth/resetPasswordForEmail";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Reset your World of Citrus account password.",
	alternates: { canonical: "/auth/reset-password" },
	openGraph: { url: "/auth/reset-password" },
};

export default async function Page({ searchParams }: PageProps<"/auth/reset-password">) {
	const { email } = await searchParams;

	return (
		<div className="flex items-center justify-center bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
			<ForgotPasswordForm
				resetPasswordForEmail={resetPasswordForEmail}
				initialEmail={typeof email === "string" ? email : undefined}
			/>
		</div>
	);
}

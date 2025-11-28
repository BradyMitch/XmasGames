import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { updatePasswordForEmail } from "@/utils/supabase/auth/updatePasswordForEmail";

export const metadata: Metadata = {
	title: "Update Password",
	description: "Update your World of Citrus account password.",
	alternates: { canonical: "/auth/update-password" },
	openGraph: { url: "/auth/update-password" },
};

export default function Page() {
	return (
		<div className="flex items-center justify-center bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
			<UpdatePasswordForm updatePasswordForEmail={updatePasswordForEmail} />
		</div>
	);
}

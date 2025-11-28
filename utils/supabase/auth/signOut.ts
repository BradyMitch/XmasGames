import { redirect } from "next/navigation";
import { createServerClient } from "../clients/server";

export const signOut = async () => {
	"use server";
	const supabase = await createServerClient();
	await supabase.auth.signOut();
	redirect("/auth/sign-in");
};

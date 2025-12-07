"use server";

import { revalidatePath } from "next/cache";
import type { Broadcast } from "@/types/tables/Broadcast";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

const verifyAdminPasscode = (passcode: string): boolean => {
	if (!ADMIN_PASSCODE) {
		throw new Error("ADMIN_PASSCODE is not configured");
	}
	return passcode === ADMIN_PASSCODE;
};

export const createBroadcast = async (
	text: string,
	passcode: string,
): Promise<Broadcast["Row"]> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	const { data: broadcast, error } = await supabase
		.from("broadcast")
		.insert({
			text,
			duration: 60,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create broadcast: ${error.message}`);
	}

	revalidatePath("/");
	return broadcast;
};

export const getLatestBroadcast = async (): Promise<Broadcast["Row"] | null> => {
	const { supabase } = await initializeServerComponent();

	const { data: broadcast, error } = await supabase
		.from("broadcast")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(1)
		.single();

	if (error && error.code !== "PGRST116") {
		throw new Error(`Failed to fetch broadcast: ${error.message}`);
	}

	return broadcast || null;
};

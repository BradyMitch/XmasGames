"use server";

import { revalidatePath } from "next/cache";
import type { DraftBroadcast } from "@/types/tables/DraftBroadcast";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

const verifyAdminPasscode = (passcode: string): boolean => {
	if (!ADMIN_PASSCODE) {
		throw new Error("ADMIN_PASSCODE is not configured");
	}
	return passcode === ADMIN_PASSCODE;
};

export const saveDraftBroadcast = async (
	text: string,
	passcode: string,
): Promise<DraftBroadcast["Row"]> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	const { data: draft, error } = await supabase
		.from("draft_broadcast")
		.insert({
			text,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to save draft broadcast: ${error.message}`);
	}

	revalidatePath("/admin/broadcast");
	revalidatePath("/");
	return draft;
};

export const getDraftBroadcasts = async (): Promise<DraftBroadcast["Row"][]> => {
	const { supabase } = await initializeServerComponent();

	const { data: drafts, error } = await supabase
		.from("draft_broadcast")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch draft broadcasts: ${error.message}`);
	}

	return drafts || [];
};

export const deleteDraftBroadcast = async (id: number, passcode: string): Promise<void> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	const { error } = await supabase.from("draft_broadcast").delete().eq("id", id);

	if (error) {
		throw new Error(`Failed to delete draft broadcast: ${error.message}`);
	}

	revalidatePath("/admin/broadcast");
};

export const broadcastDraft = async (id: number, passcode: string): Promise<void> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	// Get the draft
	const { data: draft, error: fetchError } = await supabase
		.from("draft_broadcast")
		.select("text")
		.eq("id", id)
		.single();

	if (fetchError || !draft) {
		throw new Error("Draft broadcast not found");
	}

	// Create the broadcast
	const { error: insertError } = await supabase.from("broadcast").insert({
		text: draft.text,
		duration: 60,
	});

	if (insertError) {
		throw new Error(`Failed to create broadcast: ${insertError.message}`);
	}

	revalidatePath("/");
};

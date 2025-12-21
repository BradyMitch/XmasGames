"use server";

import { revalidatePath } from "next/cache";
import type { DraftBroadcast } from "@/types/tables/DraftBroadcast";
import { createServerClient } from "@/utils/supabase/clients/server";

export const saveDraftBroadcast = async (
	text: string,
): Promise<DraftBroadcast["Row"]> => {
	const supabase = await createServerClient();

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
	const supabase = await createServerClient();

	const { data: drafts, error } = await supabase
		.from("draft_broadcast")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch draft broadcasts: ${error.message}`);
	}

	return drafts || [];
};

export const deleteDraftBroadcast = async (id: number): Promise<void> => {
	const supabase = await createServerClient();

	const { error } = await supabase.from("draft_broadcast").delete().eq("id", id);

	if (error) {
		throw new Error(`Failed to delete draft broadcast: ${error.message}`);
	}

	revalidatePath("/admin/broadcast");
};

export const broadcastDraft = async (id: number): Promise<void> => {
	const supabase = await createServerClient();

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

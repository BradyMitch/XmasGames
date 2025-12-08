"use server";

import { revalidatePath } from "next/cache";
import { PRIZE_DRAWS } from "@/utils/constants/draws";
import { createServerClient } from "@/utils/supabase/clients/server";

export async function enterDraw(profileCode: string, drawId: string, numTickets: number) {
	const supabase = await createServerClient();

	// Validate ticket amount
	if (!numTickets || numTickets < 1) {
		return { success: false, error: "Must enter at least 1 ticket" };
	}

	// Find the draw configuration
	const drawConfig = PRIZE_DRAWS.find((d) => d.id === drawId);
	if (!drawConfig) {
		return { success: false, error: "Invalid draw" };
	}

	// Get the profile
	const { data: profile, error: profileError } = await supabase
		.from("profile")
		.select("*")
		.eq("code", profileCode)
		.single();

	if (profileError || !profile) {
		return { success: false, error: "Profile not found" };
	}

	// Get all existing draw entries to calculate tickets already spent
	const { data: existingEntries } = await supabase
		.from("draw")
		.select("tickets")
		.eq("profile_id", profile.id);

	const ticketsSpent = existingEntries?.reduce((sum, entry) => sum + entry.tickets, 0) || 0;
	const availableTickets = profile.tickets - ticketsSpent;

	// Check if user has enough available tickets
	if (availableTickets < numTickets) {
		return { success: false, error: "Not enough available tickets" };
	}

	// Create draw entry (don't deduct from profile.tickets, just track the entry)
	const { error: insertError } = await supabase.from("draw").insert({
		profile_id: profile.id,
		name: drawConfig.name,
		tickets: numTickets,
	});

	if (insertError) {
		return { success: false, error: "Failed to enter draw" };
	}

	revalidatePath(`/draws/${profileCode}`);
	return { success: true };
}

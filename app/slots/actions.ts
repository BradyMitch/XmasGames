"use server";

import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

export const reduceTotalSpins = async (
	spinCount: number,
	code: string,
): Promise<{
	success: boolean;
	error?: string;
}> => {
	try {
		const { supabase } = await initializeServerComponent();

		if (!code) {
			return { success: false, error: "User code not provided" };
		}

		// Get current spin count
		const { data: profile, error: fetchError } = await supabase
			.from("profile")
			.select("spins")
			.eq("code", code)
			.single();

		if (fetchError || !profile) {
			return { success: false, error: "Failed to fetch profile" };
		}

		// Calculate new spin count (don't go below 0)
		const newSpinCount = Math.max(0, profile.spins - spinCount);

		// Update the profile
		const { error: updateError } = await supabase
			.from("profile")
			.update({ spins: newSpinCount })
			.eq("code", code);

		if (updateError) {
			return { success: false, error: "Failed to update spins" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error in reduceTotalSpins:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
};

export const incrementTickets = async (
	ticketsToAdd: number,
	code: string,
): Promise<{
	success: boolean;
	error?: string;
}> => {
	try {
		const { supabase } = await initializeServerComponent();

		if (!code) {
			return { success: false, error: "User code not provided" };
		}

		// Get current ticket count
		const { data: profile, error: fetchError } = await supabase
			.from("profile")
			.select("tickets")
			.eq("code", code)
			.single();

		if (fetchError || !profile) {
			return { success: false, error: "Failed to fetch profile" };
		}

		// Calculate new ticket count
		const newTicketCount = (profile.tickets || 0) + ticketsToAdd;

		// Update the profile
		const { error: updateError } = await supabase
			.from("profile")
			.update({ tickets: newTicketCount })
			.eq("code", code);

		if (updateError) {
			return { success: false, error: "Failed to update tickets" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error in incrementTickets:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
};

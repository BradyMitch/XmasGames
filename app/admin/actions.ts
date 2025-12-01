"use server";

import type { Profile } from "@/types/tables/Profile";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

const verifyAdminPasscode = (passcode: string): boolean => {
	if (!ADMIN_PASSCODE) {
		throw new Error("ADMIN_PASSCODE is not configured");
	}
	return passcode === ADMIN_PASSCODE;
};

export const getAllProfiles = async (passcode: string): Promise<Profile[]> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	const { data, error } = await supabase.from("profile").select("*");

	if (error) {
		throw new Error(`Failed to fetch profiles: ${error.message}`);
	}

	return data || [];
};

export const addSpinsToProfile = async (
	profileId: string,
	spinsToAdd: number,
	passcode: string,
): Promise<void> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	const { data: profile, error: fetchError } = await supabase
		.from("profile")
		.select("spins")
		.eq("id", profileId)
		.single();

	if (fetchError) {
		throw new Error(`Failed to fetch profile: ${fetchError.message}`);
	}

	const newSpins = (profile?.spins || 0) + spinsToAdd;

	const { error: updateError } = await supabase
		.from("profile")
		.update({ spins: newSpins })
		.eq("id", profileId);

	if (updateError) {
		throw new Error(`Failed to update spins: ${updateError.message}`);
	}
};

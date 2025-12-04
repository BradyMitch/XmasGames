"use server";

import { revalidatePath } from "next/cache";
import type { Code } from "@/types/tables/Code";
import type { InstantWin } from "@/types/tables/InstantWin";
import type { Profile } from "@/types/tables/Profile";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

const verifyAdminPasscode = (passcode: string): boolean => {
	if (!ADMIN_PASSCODE) {
		throw new Error("ADMIN_PASSCODE is not configured");
	}
	return passcode === ADMIN_PASSCODE;
};

// Generate a random 6-character alphanumeric code
const generateCode = (): string => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
};

export const getAllProfiles = async (passcode: string): Promise<Profile["Row"][]> => {
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
	profileId: number,
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

export const getAllCodes = async (passcode: string): Promise<Code["Row"][]> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	const { data, error } = await supabase
		.from("code")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(`Failed to fetch codes: ${error.message}`);
	}

	return data || [];
};

export const createCode = async (spins: number, passcode: string): Promise<Code["Row"]> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	// Generate unique code
	let code = generateCode();
	let isUnique = false;

	// Retry up to 10 times to get a unique code
	for (let i = 0; i < 10; i++) {
		const { data: existingCode } = await supabase
			.from("code")
			.select("id")
			.eq("code", code)
			.single();

		if (!existingCode) {
			isUnique = true;
			break;
		}

		code = generateCode();
	}

	if (!isUnique) {
		throw new Error("Failed to generate unique code");
	}

	const { data: newCode, error } = await supabase
		.from("code")
		.insert({
			code,
			spins,
			redeemed: false,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create code: ${error.message}`);
	}

	return newCode;
};

export const deleteCode = async (codeId: number, passcode: string): Promise<void> => {
	if (!verifyAdminPasscode(passcode)) {
		throw new Error("Invalid admin passcode");
	}

	const { supabase } = await initializeServerComponent();

	const { error } = await supabase.from("code").delete().eq("id", codeId);

	if (error) {
		throw new Error(`Failed to delete code: ${error.message}`);
	}
};

export const redeemCode = async (
	profileCode: string,
	bonusCode: string,
): Promise<{ spins: number }> => {
	const { supabase } = await initializeServerComponent();

	// Fetch the profile
	const { data: profile, error: profileError } = await supabase
		.from("profile")
		.select("id, spins, name")
		.eq("code", profileCode)
		.single();

	if (profileError || !profile) {
		throw new Error("Profile not found");
	}

	// Fetch the bonus code
	const { data: codeRecord, error: codeError } = await supabase
		.from("code")
		.select("*")
		.eq("code", bonusCode)
		.single();

	if (codeError || !codeRecord) {
		throw new Error("Invalid code");
	}

	if (codeRecord.redeemed) {
		throw new Error("Code has already been redeemed");
	}

	// Update profile with new spins
	const newSpins = (profile.spins || 0) + (codeRecord.spins || 0);
	const { error: updateError } = await supabase
		.from("profile")
		.update({ spins: newSpins })
		.eq("id", profile.id);

	if (updateError) {
		throw new Error(`Failed to update spins: ${updateError.message}`);
	}

	// Mark code as redeemed
	const { error: redeemError } = await supabase
		.from("code")
		.update({
			redeemed: true,
			redeemed_by_id: profile.id,
			redeemed_by_name: profile.name,
		})
		.eq("id", codeRecord.id);

	if (redeemError) {
		throw new Error(`Failed to redeem code: ${redeemError.message}`);
	}

	// Revalidate the profile path to refresh data
	revalidatePath(`/profile/${profileCode}`);

	return { spins: newSpins };
};

export const getInstantWins = async (): Promise<InstantWin["Row"][]> => {
	const { supabase } = await initializeServerComponent();

	const { data, error } = await supabase.from("instant_win").select("*");

	if (error) {
		throw new Error(`Failed to fetch instant wins: ${error.message}`);
	}

	return data || [];
};

export const getUnwonInstantWins = async (): Promise<InstantWin["Row"][]> => {
	const { supabase } = await initializeServerComponent();

	const { data, error } = await supabase.from("instant_win").select("*").eq("won", false);

	if (error) {
		throw new Error(`Failed to fetch unwon instant wins: ${error.message}`);
	}

	return data || [];
};

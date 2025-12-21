"use server";

import { revalidatePath } from "next/cache";
import type { Broadcast } from "@/types/tables/Broadcast";
import { createServerClient } from "@/utils/supabase/clients/server";

export const createBroadcast = async (
	text: string,
): Promise<Broadcast["Row"]> => {
	"use server";
	const supabase = await createServerClient();

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
	"use server";
	const supabase = await createServerClient();

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

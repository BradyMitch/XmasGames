import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateCode(): string {
	let code = "";
	for (let i = 0; i < 4; i++) {
		code += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
	}
	return code;
}

export async function generateUniqueCode(supabase: SupabaseClient<Database>): Promise<string> {
	let code = generateCode();
	let isUnique = false;
	let attempts = 0;
	const maxAttempts = 10;

	while (!isUnique && attempts < maxAttempts) {
		const { data } = await supabase.from("profile").select("code").eq("code", code).single();

		if (!data) {
			isUnique = true;
		} else {
			code = generateCode();
			attempts++;
		}
	}

	if (!isUnique) {
		throw new Error("Failed to generate unique code after multiple attempts");
	}

	return code;
}

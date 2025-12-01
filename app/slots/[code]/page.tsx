import { redirect } from "next/navigation";
import { SlotsGame } from "@/components/slots/SlotsGame";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";
import { incrementTickets, reduceTotalSpins } from "../actions";

export default async function Page({ params }: PageProps<"/slots/[code]">) {
	const { code } = await params;

	if (!code) {
		redirect("/");
	}

	const { supabase } = await initializeServerComponent();

	// Fetch user's spins from database
	const { data: profile } = await supabase
		.from("profile")
		.select("spins, tickets")
		.eq("code", code)
		.single();

	if (!profile) {
		redirect("/");
	}

	// Create a wrapper function to bind the code to the server action
	const onSpinCompleted = async (spinCount: number) => {
		"use server";
		return reduceTotalSpins(spinCount, code);
	};

	const onTicketsEarned = async (ticketCount: number) => {
		"use server";
		return incrementTickets(ticketCount, code);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex flex-col">
			{/* Snowflake decorations */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div className="absolute -top-4 left-8 text-4xl opacity-20 animate-[spin_20s_linear_infinite]">
					❄️
				</div>
				<div
					className="absolute top-24 right-10 text-5xl opacity-15 animate-[spin_26s_linear_infinite]"
					style={{ animationDelay: "1s" }}
				>
					❄️
				</div>
				<div
					className="absolute bottom-32 left-1/5 text-4xl opacity-20 animate-[spin_24s_linear_infinite]"
					style={{ animationDelay: "2s" }}
				>
					❄️
				</div>
				<div
					className="absolute bottom-10 right-1/4 text-5xl opacity-15 animate-[spin_30s_linear_infinite]"
					style={{ animationDelay: "1.5s" }}
				>
					❄️
				</div>
			</div>

			{/* Main content */}
			<main className="flex-1 flex items-center justify-center px-4 py-10 md:py-16 relative z-10">
				<SlotsGame
					initialSpins={profile.spins}
					initialTickets={profile.tickets}
					onSpinCompleted={onSpinCompleted}
					onTicketsEarned={onTicketsEarned}
				/>
			</main>

			{/* Footer */}
			<footer className="w-full px-4 py-6 text-center text-emerald-800/80 text-xs md:text-sm relative z-10">
				<p>Press SPACE or click the button to spin! 🎰</p>
			</footer>
		</div>
	);
}

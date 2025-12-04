import Link from "next/link";
import AdminPasscodeForm from "@/components/admin/AdminPasscodeForm";
import { InstantWinsManager } from "@/components/admin/InstantWinsManager";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

export default async function InstantWinsAdminPage({
	searchParams,
}: PageProps<"/admin/instant-wins">) {
	const params = await searchParams;
	const { supabase } = await initializeServerComponent();
	const passcode = params.passcode as string | undefined;

	if (!passcode) {
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
					<div className="max-w-xl w-full">
						<div className="bg-white/80 backdrop-blur-md border border-white/70 shadow-xl rounded-2xl px-6 py-8 md:px-10 md:py-10">
							<div className="flex items-center justify-between mb-6">
								<h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950">
									Instant Wins
								</h1>
								<Link
									href="/admin"
									className="text-emerald-600 hover:text-emerald-800 text-3xl font-light"
								>
									×
								</Link>
							</div>
							<p className="text-base text-emerald-800/90 mb-6">
								Enter admin passcode to access instant wins
							</p>
							<AdminPasscodeForm redirectTo="/admin/instant-wins" />
						</div>
					</div>
				</main>

				{/* Footer */}
				<footer className="w-full px-4 py-6 text-center text-emerald-800/80 text-xs md:text-sm relative z-10">
					<p>Authenticate to manage 🔐</p>
				</footer>
			</div>
		);
	}

	const { data: instant_wins } = await supabase.from("instant_win").select("*");

	const { data: profiles } = await supabase.from("profile").select("*");

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
			<main className="flex-1 px-4 py-8 md:py-16 relative z-10">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-between mb-8">
						<h1 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Instant Wins</h1>
						<Link
							href="/admin"
							className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition shadow-md"
						>
							← Back
						</Link>
					</div>
					<InstantWinsManager instant_wins={instant_wins || []} profiles={profiles || []} />
				</div>
			</main>

			{/* Footer */}
			<footer className="w-full px-4 py-6 text-center text-emerald-800/80 text-xs md:text-sm relative z-10">
				<p>Manage instant wins with care 🎁</p>
			</footer>
		</div>
	);
}

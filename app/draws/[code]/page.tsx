import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DrawsManager } from "@/components/draws/DrawsManager";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

export const metadata: Metadata = {
	title: "Prize Draws",
	description: "Enter prize draws using your tickets.",
	alternates: { canonical: "/draws/[code]" },
	openGraph: { url: "/draws/[code]" },
};

export default async function Page({ params }: PageProps<"/draws/[code]">) {
	const { code } = await params;
	const { supabase } = await initializeServerComponent();

	if (!code) redirect("/profile/create");

	const { data: profile } = await supabase.from("profile").select("*").eq("code", code).single();

	if (!profile) redirect("/profile/create");

	// Get user's draw entries
	const { data: drawEntries } = await supabase
		.from("draw")
		.select("*")
		.eq("profile_id", profile.id);

	// Calculate available tickets (total minus tickets spent on draws)
	const ticketsSpent = drawEntries?.reduce((sum, entry) => sum + entry.tickets, 0) || 0;
	const availableTickets = profile.tickets - ticketsSpent;

	return (
		<div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-10 md:py-14">
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
					className="absolute bottom-32 left-1/4 text-4xl opacity-20 animate-[spin_24s_linear_infinite]"
					style={{ animationDelay: "2s" }}
				>
					❄️
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 relative z-10">
				{/* Header */}
				<header className="text-center mb-8 md:mb-10">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 mb-4 shadow-sm">
						<span className="text-[10px]">●</span>
						Xmas Eve Games • Prize Draws
					</div>

					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-lg text-4xl transform rotate-3">
								<span>{profile.avatar}</span>
							</div>
							<div className="text-left">
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight uppercase">
									Prize Draws
								</h1>
								<p className="text-sm md:text-base font-medium text-emerald-800/80">
									Use your tickets to enter exciting prize draws!
								</p>
							</div>
						</div>
					</div>
				</header>

				{/* Current Tickets & Info */}
				<section className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 px-6 py-7 md:px-8 md:py-9 mb-8 ring-1 ring-emerald-900/5">
					{/* Top strip: label */}
					<div className="flex items-center justify-between gap-3 mb-6">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800/60">
							Your Balance
						</p>
						<span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600/60 bg-emerald-50 px-2 py-1 rounded-lg">
							Live Stats
						</span>
					</div>

					<div className="grid gap-6 md:grid-cols-2 mb-6">
						{/* Available Tickets Card */}
						<div className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 shadow-lg shadow-amber-900/5 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-900/10">
							<div className="absolute -right-4 -top-4 text-8xl opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
								🎫
							</div>
							<div className="relative">
								<p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-2">
									Available Tickets
								</p>
								<p className="text-5xl md:text-6xl font-black text-amber-950 leading-none tracking-tight mb-3">
									{availableTickets}
								</p>
								<div className="flex items-center gap-2 text-xs font-bold text-amber-800/60">
									<span>{profile.tickets} total earned</span>
									{ticketsSpent > 0 && (
										<>
											<span>•</span>
											<span className="text-amber-700">{ticketsSpent} spent</span>
										</>
									)}
								</div>
							</div>
						</div>

						{/* General Draw Info Card */}
						<div className="group relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-lg shadow-indigo-900/5 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-900/10">
							<div className="absolute -right-4 -top-4 text-8xl opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
								🏆
							</div>
							<div className="relative h-full flex flex-col justify-center">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-xl">ℹ️</span>
									<p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">
										General Draw
									</p>
								</div>
								<p className="text-indigo-950 font-bold text-lg leading-tight mb-2">
									Your total tickets count!
								</p>
								<p className="text-sm font-medium text-indigo-900/60 leading-relaxed">
									At the end of the night, a general prize draw will include your overall ticket
									balance. Spending tickets here does not reduce your chances for the grand prize!
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Available Draws */}
				<section className="mb-8">
					<div className="mb-6">
						<h2 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight uppercase mb-2">
							Available Prize Draws
						</h2>
						<p className="text-sm md:text-base text-emerald-700/70 font-medium">
							Enter your favorite draws below. Some draws have entry limits.
						</p>
					</div>

					<DrawsManager
						profileCode={code}
						currentTickets={profile.tickets}
						userDrawEntries={drawEntries || []}
					/>
				</section>

				{/* Back to profile link */}
				<div className="flex justify-center">
					<Link
						href={`/profile/${code}`}
						className="group inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md"
					>
						<span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
						Back to Profile
					</Link>
				</div>
			</div>
		</div>
	);
}

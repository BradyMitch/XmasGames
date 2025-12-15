import Link from "next/link";
import { redirect } from "next/navigation";
import TriviaPlayerView from "@/components/trivia/TriviaPlayerView";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";
import { getLeaderboard, joinGame, submitAnswer } from "./actions";

export default async function TriviaPage({ params }: PageProps<"/trivia/[code]">) {
	const { code } = await params;
	const { supabase } = await initializeServerComponent();

	if (!code) redirect("/profile/create");

	const { data: profile } = await supabase.from("profile").select("*").eq("code", code).single();

	if (!profile) redirect("/profile/create");

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
						Xmas Eve Games • Trivia
					</div>

					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-lg text-4xl transform rotate-3">
								<span>{profile.avatar}</span>
							</div>
							<div className="text-left">
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight uppercase">
									Trivia
								</h1>
								<p className="text-sm md:text-base font-medium text-emerald-800/80">
									Answer correctly for a chance to win more spins!
								</p>
							</div>
						</div>
					</div>
				</header>

				{/* Available Draws */}
				<section className="mb-8">
					<TriviaPlayerView
						joinGame={joinGame}
						submitAnswer={submitAnswer}
						getLeaderboard={getLeaderboard}
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

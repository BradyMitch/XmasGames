import Link from "next/link";
import TriviaGameManager from "@/components/admin/trivia/TriviaGameManager";
import { createServerClient } from "@/utils/supabase/clients/server";
import {
	createGameSession,
	getAnswerCounts,
	getLeaderboard,
	getQuizQuestions,
	startQuestion,
	updateGameStatus,
} from "./actions";

export default async function Page() {
	const supabase = await createServerClient();
	const { data: quizzes } = await supabase.from("quiz").select("*");

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
					<TriviaGameManager
						quizzes={quizzes || []}
						createGameSession={createGameSession}
						updateGameStatus={updateGameStatus}
						startQuestion={startQuestion}
						getQuizQuestions={getQuizQuestions}
						getLeaderboard={getLeaderboard}
						getAnswerCounts={getAnswerCounts}
					/>
				</div>
				<div className="flex justify-center mt-16">
					<Link
						href="/admin"
						className="group inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md"
					>
						<span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
						Back to Admin
					</Link>
				</div>
			</main>

			{/* Footer */}
			<footer className="w-full px-4 py-6 text-center text-emerald-800/80 text-xs md:text-sm relative z-10">
				<p>Manage trivia with care 🎄</p>
			</footer>
		</div>
	);
}

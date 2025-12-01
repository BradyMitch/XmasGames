import { GiftButton } from "@/components/GiftButton";

export default async function Page() {
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
						{/* Top badge + icons */}
						<div className="flex flex-col items-center gap-4 mb-6">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700 uppercase tracking-[0.12em]">
								<span className="text-[10px]">●</span>
								Xmas Eve Family Games • 2025
							</div>

							<div className="flex justify-center gap-3 text-4xl md:text-5xl">
								<span className="drop-shadow-sm">🎁</span>
								<span className="drop-shadow-sm">🎲</span>
								<span className="drop-shadow-sm">🎄</span>
							</div>
						</div>

						{/* Hero copy */}
						<div className="text-center mb-8">
							<h1 className="text-2xl md:text-4xl font-extrabold text-emerald-950 mb-3 tracking-tight">
								Welcome to the Xmas Games Night
							</h1>

							<p className="text-base md:text-lg text-emerald-800/90 mb-4">
								Spin the slots, earn tickets, and unlock surprises as we play our way through
								Christmas Eve together. 🎅
							</p>
						</div>

						{/* CTA + copy */}
						<div className="flex flex-col items-center gap-4">
							<div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
								<div className="shrink-0">
									<GiftButton />
								</div>

								<div className="text-center md:text-left">
									<p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-2">
										Start here
									</p>
									<p className="text-sm md:text-base text-emerald-800">
										Tap the present to <span className="font-semibold">open your profile</span>, see
										your spins, and get ready for the first game.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="w-full px-4 py-6 text-center text-emerald-800/80 text-xs md:text-sm relative z-10">
				<p>Merry Christmas and happy gaming! 🎄</p>
			</footer>
		</div>
	);
}

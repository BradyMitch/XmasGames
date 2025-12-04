import { GiftButton } from "@/components/GiftButton";

export default async function Page() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex flex-col relative overflow-hidden">
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
			<main className="flex-1 flex items-center justify-center px-4 py-6 md:py-10 relative z-10">
				<div className="max-w-xl w-full">
					<div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 ring-1 ring-emerald-900/5 px-6 py-8 md:px-10 md:py-10 text-center relative overflow-hidden">
						{/* Decorative background gradient inside card */}
						<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

						{/* Top badge + icons */}
						<div className="relative flex flex-col items-center gap-4 mb-6">
							<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700 uppercase tracking-[0.15em] shadow-sm">
								<span className="text-[10px] animate-pulse">●</span>
								Xmas Eve Family Games • 2025
							</div>

							<div className="flex justify-center gap-4 text-4xl md:text-5xl filter drop-shadow-md">
								<span className="hover:scale-110 transition-transform cursor-default">🎁</span>
								<span className="hover:scale-110 transition-transform cursor-default delay-75">
									🎲
								</span>
								<span className="hover:scale-110 transition-transform cursor-default delay-150">
									🎄
								</span>
							</div>
						</div>

						{/* Hero copy */}
						<div className="relative mb-8">
							<h1 className="text-2xl md:text-4xl font-black text-emerald-950 mb-3 tracking-tight leading-tight">
								Welcome to the{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
									Sandpiper
								</span>{" "}
								Xmas Games Night
							</h1>

							<p className="text-sm md:text-base font-medium text-emerald-800/70 max-w-md mx-auto leading-relaxed">
								Spin the slots, earn tickets, and unlock surprises as we play our way through
								Christmas Eve together. 🎅
							</p>
						</div>

						{/* CTA + copy */}
						<div className="relative flex flex-col items-center gap-6">
							<div className="p-5 rounded-[32px] bg-gradient-to-br from-red-50 via-white to-red-50/30 border border-red-100 shadow-lg shadow-red-900/5 w-full">
								<div className="flex flex-col md:flex-row items-center gap-5 md:gap-6">
									<div className="shrink-0 transform hover:scale-105 transition-transform duration-300">
										<GiftButton />
									</div>

									<div className="text-center md:text-left flex-1">
										<p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400 mb-2">
											Start here
										</p>
										<p className="text-sm font-medium text-emerald-900/80 leading-relaxed">
											Tap the present to{" "}
											<span className="font-bold text-emerald-950 bg-emerald-100/50 px-1 rounded">
												open your profile
											</span>
											, see your spins, and get ready for the first game.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="w-full px-4 py-6 text-center relative z-10">
				<p className="text-xs font-bold uppercase tracking-widest text-emerald-900/30">
					Merry Christmas and happy gaming! 🎄
				</p>
			</footer>
		</div>
	);
}

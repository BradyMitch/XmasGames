import Link from "next/link";

export default function AdminPage() {
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
						{/* Header */}
						<div className="text-center mb-8">
							<div className="text-4xl md:text-5xl mb-4">⚙️</div>
							<h1 className="text-2xl md:text-4xl font-extrabold text-emerald-950 mb-3 tracking-tight">
								Admin Panel
							</h1>
							<p className="text-base md:text-lg text-emerald-800/90">Manage the Christmas games</p>
						</div>

						{/* Navigation */}
						<nav className="space-y-3">
							<Link
								href="/admin/profiles"
								className="block w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition shadow-md"
							>
								Manage Profiles
							</Link>
							<Link
								href="/admin/codes"
								className="block w-full text-center bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition shadow-md"
							>
								Manage Codes
							</Link>
							<Link
								href="/admin/broadcast"
								className="block w-full text-center bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition shadow-md"
							>
								Create Broadcast
							</Link>
							<Link
								href="/admin/draw"
								className="block w-full text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition shadow-md"
							>
								Prize Draw
							</Link>
							<Link
								href="/admin/instant-wins"
								className="block w-full text-center bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition shadow-md"
							>
								Instant Wins
							</Link>
							<Link
								href="/admin/qr"
								className="block w-full text-center bg-gradient-to-r from-sky-600 to-sky-700 text-white py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-sky-800 transition shadow-md"
							>
								QR Code
							</Link>
						</nav>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="w-full px-4 py-6 text-center text-emerald-800/80 text-xs md:text-sm relative z-10">
				<p>Manage the games with care 🎄</p>
			</footer>
		</div>
	);
}

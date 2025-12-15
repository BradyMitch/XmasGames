import Link from "next/link";

export default function AdminPage() {
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

			<div className="max-w-5xl mx-auto px-4 relative z-10">
				{/* Header */}
				<header className="text-center mb-10 md:mb-14">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 mb-4 shadow-sm">
						<span className="text-[10px]">●</span>
						Xmas Eve Games • Admin
					</div>

					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-lg text-4xl transform -rotate-3">
								<span>⚙️</span>
							</div>
							<div className="text-left">
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight uppercase">
									Admin Panel
								</h1>
								<p className="text-sm md:text-base font-medium text-emerald-800/80">
									Manage games, players, and prizes.
								</p>
							</div>
						</div>
					</div>
				</header>

				{/* Admin Actions Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{/* Trivia */}
					<Link
						href="/admin/trivia"
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-500 to-purple-600 p-1 shadow-[0_20px_40px_-12px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(139,92,246,0.6)] active:scale-[0.98]"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>
						<div className="relative flex flex-col justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-5 py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
									❓
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm">
									Trivia
								</h2>
								<p className="text-xs font-medium text-violet-100 opacity-90 leading-relaxed">
									Control the quiz game
								</p>
							</div>
						</div>
					</Link>

					{/* Profiles */}
					<Link
						href="/admin/profiles"
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-600 p-1 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.6)] active:scale-[0.98]"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>
						<div className="relative flex flex-col justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-5 py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
									👥
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm">
									Profiles
								</h2>
								<p className="text-xs font-medium text-emerald-100 opacity-90 leading-relaxed">
									Manage players & scores
								</p>
							</div>
						</div>
					</Link>

					{/* Codes */}
					<Link
						href="/admin/codes"
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 p-1 shadow-[0_20px_40px_-12px_rgba(20,184,166,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(20,184,166,0.6)] active:scale-[0.98]"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>
						<div className="relative flex flex-col justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-5 py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
									🔑
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm">
									Codes
								</h2>
								<p className="text-xs font-medium text-teal-100 opacity-90 leading-relaxed">
									Generate access codes
								</p>
							</div>
						</div>
					</Link>

					{/* Broadcast */}
					<Link
						href="/admin/broadcast"
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600 p-1 shadow-[0_20px_40px_-12px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.6)] active:scale-[0.98]"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>
						<div className="relative flex flex-col justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-5 py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
									📢
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm">
									Broadcast
								</h2>
								<p className="text-xs font-medium text-amber-100 opacity-90 leading-relaxed">
									Send messages to TV
								</p>
							</div>
						</div>
					</Link>

					{/* Prize Draw */}
					<Link
						href="/admin/draw"
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600 via-fuchsia-500 to-pink-600 p-1 shadow-[0_20px_40px_-12px_rgba(192,38,211,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(192,38,211,0.6)] active:scale-[0.98]"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>
						<div className="relative flex flex-col justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-5 py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
									🎁
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm">
									Prize Draw
								</h2>
								<p className="text-xs font-medium text-fuchsia-100 opacity-90 leading-relaxed">
									Pick winners
								</p>
							</div>
						</div>
					</Link>

					{/* Instant Wins */}
					<Link
						href="/admin/instant-wins"
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-rose-600 p-1 shadow-[0_20px_40px_-12px_rgba(220,38,38,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(220,38,38,0.6)] active:scale-[0.98]"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>
						<div className="relative flex flex-col justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-5 py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
									🎰
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm">
									Instant Wins
								</h2>
								<p className="text-xs font-medium text-red-100 opacity-90 leading-relaxed">
									Manage slot prizes
								</p>
							</div>
						</div>
					</Link>

					{/* QR Code */}
					<Link
						href="/admin/qr"
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-blue-600 p-1 shadow-[0_20px_40px_-12px_rgba(2,132,199,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(2,132,199,0.6)] active:scale-[0.98] sm:col-span-2 lg:col-span-3"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>
						<div className="relative flex flex-row items-center justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-6 py-6">
							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm">
									QR Code
								</h2>
								<p className="text-xs font-medium text-sky-100 opacity-90 leading-relaxed">
									Display join code
								</p>
							</div>
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
								📱
							</div>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}

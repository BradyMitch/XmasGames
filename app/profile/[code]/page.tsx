import Link from "next/link";
import { redirect } from "next/navigation";
import { BackToHomeButton } from "@/components/profile/BackToHomeButton";
import CodeRedemption from "@/components/profile/CodeRedemption";
import { ForgetCodeButton } from "@/components/profile/ForgetCodeButton";
import { LocalStorageSync } from "@/components/profile/LocalStorageSync";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

export default async function Page({ params }: PageProps<"/profile/[code]">) {
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

			<div className="max-w-4xl mx-auto px-4 relative z-10">
				{/* Header (you liked this) */}
				<header className="text-center mb-8 md:mb-10">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 mb-4 shadow-sm">
						<span className="text-[10px]">●</span>
						Xmas Eve Games • Player Profile
					</div>

					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-lg text-4xl transform rotate-3">
								<span>{profile.avatar}</span>
							</div>
							<div className="text-left">
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-emerald-950 tracking-tight uppercase">
									Welcome, {profile.name}!
								</h1>
								<p className="text-sm md:text-base font-medium text-emerald-800/80">
									Here&apos;s your current stash of spins and tickets.
								</p>
							</div>
						</div>
					</div>
				</header>

				{/* Redesigned stats / code section */}
				<section className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 px-6 py-7 md:px-8 md:py-9 mb-8 ring-1 ring-emerald-900/5">
					{/* Top strip: label */}
					<div className="flex items-center justify-between gap-3 mb-6">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800/60">
							Tonight&apos;s balance
						</p>
						<span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600/60 bg-emerald-50 px-2 py-1 rounded-lg">
							Live Stats
						</span>
					</div>

					{/* Main stats row */}
					<div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] items-stretch mb-6">
						{/* Spins + Tickets side-by-side */}
						<div className="grid grid-cols-2 gap-4">
							{/* Spins */}
							<div className="group relative overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-rose-50 via-white to-red-50 p-5 shadow-lg shadow-red-900/5 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-red-900/10">
								<div className="absolute -right-4 -top-4 text-6xl opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
									🎰
								</div>
								<div className="relative">
									<p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mb-1">
										Spins
									</p>
									<p className="text-4xl md:text-5xl font-black text-red-950 leading-none tracking-tight mb-2">
										{profile.spins}
									</p>
									<p className="text-[11px] font-medium text-red-900/40 leading-tight">
										Spin to win tickets
									</p>
								</div>
							</div>

							{/* Tickets */}
							<div className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-5 shadow-lg shadow-amber-900/5 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-900/10">
								<div className="absolute -right-3 -top-3 text-6xl opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
									🎫
								</div>
								<div className="relative">
									<p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mb-1">
										Tickets
									</p>
									<p className="text-4xl md:text-5xl font-black text-amber-950 leading-none tracking-tight mb-2">
										{profile.tickets}
									</p>
									<p className="text-[11px] font-medium text-amber-900/40 leading-tight">
										For the prize draw
									</p>
								</div>
							</div>
						</div>

						{/* Code panel */}
						<div className="flex flex-col justify-between gap-3 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 p-5 shadow-lg shadow-emerald-900/5">
							<div>
								<p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3">
									Profile Code
								</p>
								<div className="group relative inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-white border-2 border-emerald-100 shadow-sm w-full transition-all hover:border-emerald-200 hover:shadow-md">
									<p className="text-2xl md:text-3xl font-mono font-black text-emerald-950 tracking-[0.25em] group-hover:scale-105 transition-transform">
										{code}
									</p>
								</div>
							</div>
							<p className="text-[11px] font-medium text-emerald-900/40 leading-relaxed">
								Use this code to access your profile on any device. Keep it safe!
							</p>
						</div>
					</div>

					{/* Info bar */}
					<div className="mt-2 rounded-2xl border border-sky-100 bg-sky-50/50 px-4 py-3 text-xs md:text-sm text-sky-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<div className="flex items-center gap-2 font-bold text-sky-700">
							<span className="text-lg">💾</span>
							<span>Saved to this browser</span>
						</div>

						<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
							<ForgetCodeButton />
						</div>
					</div>
				</section>

				{/* Game Actions Grid */}
				<section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					{/* Play Slots */}
					<Link
						href={`/slots/${code}`}
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
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm lg:text-3xl">
									Play Slots
								</h2>
								<p className="text-xs font-medium text-red-100 opacity-90 leading-relaxed">
									Spin to win tickets & instant prizes!
								</p>
							</div>
						</div>
					</Link>

					{/* Enter Draws */}
					<Link
						href={`/draws/${code}`}
						className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-600 p-1 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.6)] active:scale-[0.98]"
					>
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position] duration-[0s] hover:bg-[position:200%_0,0_0] hover:duration-[1.5s]"></div>

						<div className="relative flex flex-col justify-between h-full rounded-[20px] bg-gradient-to-b from-white/10 to-transparent px-5 py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md transition-transform duration-500 group-hover:rotate-12 border border-white/20">
									🎁
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm lg:text-3xl">
									Enter Draws
								</h2>
								<p className="text-xs font-medium text-emerald-100 opacity-90 leading-relaxed">
									Use your tickets to win amazing prizes!
								</p>
							</div>
						</div>
					</Link>

					{/* Trivia */}
					<Link
						href={`/trivia/${code}`}
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
								<h2 className="text-2xl font-black uppercase tracking-tight text-white text-shadow-sm lg:text-3xl">
									Play Trivia
								</h2>
								<p className="text-xs font-medium text-violet-100 opacity-90 leading-relaxed">
									Test your knowledge and have fun!
								</p>
							</div>
						</div>
					</Link>
				</section>

				{/* Secondary Actions */}
				<section className="flex flex-col gap-6">
					<CodeRedemption profileCode={code} />{" "}
					<div className="flex justify-center">
						<BackToHomeButton />
					</div>
				</section>
			</div>

			<LocalStorageSync code={code} />
		</div>
	);
}

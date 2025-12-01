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
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 mb-4">
						<span className="text-[10px]">●</span>
						Xmas Eve Games • Player Profile
					</div>

					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-3">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 shadow-sm text-3xl">
								<span>{profile.avatar}</span>
							</div>
							<div className="text-left">
								<h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-emerald-950 tracking-tight">
									Welcome, {profile.name}!
								</h1>
								<p className="text-sm md:text-base text-emerald-800/90">
									Here&apos;s your current stash of spins and tickets.
								</p>
							</div>
						</div>
					</div>
				</header>

				{/* Redesigned stats / code section */}
				<section className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-50 px-6 py-7 md:px-8 md:py-9 mb-6">
					{/* Top strip: label */}
					<div className="flex items-center justify-between gap-3 mb-4">
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
							Tonight&apos;s balance
						</p>
						<span className="text-[11px] text-emerald-700/80">
							Spins become tickets. Tickets become prizes. 🎁
						</span>
					</div>

					{/* Main stats row */}
					<div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] items-stretch mb-5">
						{/* Spins + Tickets side-by-side */}
						<div className="grid grid-cols-2 gap-4">
							{/* Spins */}
							<div className="relative overflow-hidden rounded-xl border border-red-100 bg-gradient-to-br from-rose-50 via-red-50 to-red-100/80 p-4 shadow-sm">
								<div className="absolute -right-4 -top-4 text-5xl opacity-15">🎰</div>
								<div className="relative">
									<p className="text-[11px] font-semibold text-red-700 uppercase tracking-[0.16em] mb-1">
										Spins
									</p>
									<p className="text-3xl md:text-4xl font-extrabold text-red-900 leading-tight">
										{profile.spins}
									</p>
									<p className="text-[11px] text-red-800/85 mt-1">
										Use these on the slot machine to try for more tickets.
									</p>
								</div>
							</div>

							{/* Tickets */}
							<div className="relative overflow-hidden rounded-xl border border-yellow-100 bg-gradient-to-br from-amber-50 via-yellow-50 to-yellow-100/80 p-4 shadow-sm">
								<div className="absolute -right-3 -top-3 text-5xl opacity-15">🎫</div>
								<div className="relative">
									<p className="text-[11px] font-semibold text-amber-700 uppercase tracking-[0.16em] mb-1">
										Tickets
									</p>
									<p className="text-3xl md:text-4xl font-extrabold text-amber-900 leading-tight">
										{profile.tickets}
									</p>
									<p className="text-[11px] text-amber-800/85 mt-1">
										These go into the prize draw at the end of the night.
									</p>
								</div>
							</div>
						</div>

						{/* Code panel */}
						<div className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-sm">
							<div>
								<p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-[0.16em] mb-2">
									Your profile code
								</p>
								<div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-emerald-200 shadow-sm w-full">
									<p className="text-lg md:text-xl font-mono font-bold text-emerald-900 tracking-[0.35em]">
										{code}
									</p>
								</div>
							</div>
							<p className="text-[11px] text-emerald-800/90">
								You can re-open this profile on any device using this code. Think of it as your
								secret player ticket.
							</p>
						</div>
					</div>

					{/* Info bar */}
					<div className="mt-2 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-xs md:text-sm text-sky-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<div className="flex items-center gap-2 font-semibold">
							<span>💡</span>
							<span>Saved to this browser</span>
						</div>

						<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
							<p className="text-sky-800 md:text-[13px]">
								If you clear your history or switch devices, you&apos;ll need this code to get your
								spins and tickets back.
							</p>

							<ForgetCodeButton />
						</div>
					</div>
				</section>

				{/* Code Redemption Section */}
				<section className="mb-6">
					<CodeRedemption profileCode={code} />
				</section>

				{/* Action Buttons */}
				<section className="flex flex-col md:flex-row gap-3 md:gap-4">
					<Link
						href={`/slots/${code}`}
						className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg text-base md:text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-center"
					>
						Play slots 🎰
					</Link>

					<BackToHomeButton />
				</section>
			</div>

			<LocalStorageSync code={code} />
		</div>
	);
}

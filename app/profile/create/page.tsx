import { redirect } from "next/navigation";
import { CreateProfileForm } from "@/components/profile/CreateProfileForm";
import { ExistingCodeInput } from "@/components/profile/ExistingCodeInput";
import { generateUniqueCode } from "@/utils/profile/generateUniqueCode";
import { initializeServerComponent } from "@/utils/supabase/helpers/initializeServerComponent";

async function createProfileAction(formData: FormData) {
	"use server";

	const { supabase } = await initializeServerComponent();
	const name = formData.get("name") as string;
	const avatar = formData.get("avatar") as string;
	const code = await generateUniqueCode(supabase);

	const { data, error } = await supabase
		.from("profile")
		.insert({
			name,
			avatar,
			code,
			spins: 50,
			tickets: 50,
		})
		.select()
		.single();

	if (error) {
		console.error("Error creating profile:", error);
		return;
	}

	redirect(`/profile/${data?.code}`);
}

export default async function Page() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-10 md:py-14 flex items-center">
			{/* Snowflakes */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div className="absolute -top-4 left-8 text-4xl opacity-20 animate-[spin_20s_linear_infinite]">
					❄️
				</div>
				<div className="absolute top-24 right-10 text-5xl opacity-15 animate-[spin_26s_linear_infinite]">
					❄️
				</div>
				<div className="absolute bottom-32 left-1/4 text-4xl opacity-20 animate-[spin_24s_linear_infinite]">
					❄️
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 relative z-10 w-full">
				{/* 2-column grid on desktop */}
				<div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] auto-rows-max items-start">
					{/* LEFT: intro + (desktop) existing-code */}
					<section className="space-y-6">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
							<span className="text-[10px]">●</span>
							Xmas Eve Games • 2025
						</div>

						<div>
							<h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-emerald-950 mb-3 tracking-tight uppercase">
								Create your player profile
							</h1>
							<p className="text-sm md:text-base font-medium text-emerald-800/80 leading-relaxed">
								Your name &amp; emoji appear on games, leaderboards, and the ticket draw list.
							</p>
						</div>

						<ul className="text-xs md:text-sm font-medium text-emerald-800/80 space-y-2">
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-emerald-600 font-bold">✔</span>
								<span>Start with 50 spins — win more throughout the night.</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-emerald-600 font-bold">✔</span>
								<span>Your avatar appears everywhere tonight.</span>
							</li>
						</ul>

						{/* Existing code section (desktop only, sits under intro on left) */}
						<section className="hidden md:block">
							<div className="mt-8 bg-white/90 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-2xl p-8 ring-1 ring-emerald-900/5 relative overflow-hidden">
								{/* Decorative background gradient inside card */}
								<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

								<div className="relative">
									<h2 className="text-lg font-black uppercase tracking-tight text-emerald-950 text-center mb-2">
										Already have a profile?
									</h2>
									<p className="text-sm font-medium text-emerald-800/70 text-center mb-6">
										Enter your code to jump back in.
									</p>

									<ExistingCodeInput />
								</div>
							</div>
						</section>
					</section>

					{/* RIGHT: create profile form */}
					<section className="mt-2 md:mt-0 flex justify-center">
						<CreateProfileForm createProfile={createProfileAction} />
					</section>
				</div>

				{/* Existing code section (mobile only, below form) */}
				<section className="mt-8 md:hidden max-w-xl mx-auto">
					<div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-2xl p-8 ring-1 ring-emerald-900/5 relative overflow-hidden">
						{/* Decorative background gradient inside card */}
						<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

						<div className="relative">
							<h2 className="text-lg font-black uppercase tracking-tight text-emerald-950 text-center mb-2">
								Already have a profile?
							</h2>
							<p className="text-sm font-medium text-emerald-800/70 text-center mb-6">
								Enter your code to jump back in.
							</p>

							<ExistingCodeInput />
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

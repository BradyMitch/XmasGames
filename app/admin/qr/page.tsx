import Image from "next/image";
import Link from "next/link";

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
				<div className="w-full max-w-4xl">
					<div className="rounded-[40px] border border-white/50 bg-white/90 px-6 py-8 shadow-2xl backdrop-blur-xl md:px-10 md:py-10 ring-1 ring-emerald-900/5 relative overflow-hidden">
						{/* Decorative background gradient inside card */}
						<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

						{/* Header */}
						<header className="mb-8 flex flex-col items-center gap-3 relative">
							<div
								className={
									"inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 " +
									"px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700 shadow-sm"
								}
							>
								<span className="text-[10px] animate-pulse">●</span>
								Sandpiper Xmas Games 2025
							</div>
							<h1
								className={
									"text-center text-3xl font-black uppercase tracking-tight text-emerald-950 " +
									"md:text-4xl lg:text-5xl"
								}
							>
								Join the Fun
							</h1>
						</header>

						<Image
							src="/qr-code.png"
							alt="QR Code to join Sandpiper Xmas Games"
							width={250}
							height={250}
							className="mx-auto mb-8"
						/>

						{/* Back button */}
						<div className="mt-8 flex justify-center">
							<Link
								href="/admin"
								className={
									"inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/50 border border-white/60 " +
									"text-emerald-800/60 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-emerald-900 hover:shadow-md " +
									"transition-all duration-300 backdrop-blur-sm group"
								}
							>
								<span className="group-hover:-translate-x-0.5 transition-transform">←</span>
								Back to admin
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

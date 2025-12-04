"use client";

import { useRouter } from "next/navigation";

export const BackToHomeButton = () => {
	const router = useRouter();

	const handleRedirect = () => {
		router.push("/");
	};

	return (
		<button
			type="button"
			onClick={handleRedirect}
			className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/50 border border-white/60 text-emerald-800/60 font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-white hover:text-emerald-900 hover:shadow-md transition-all duration-300 backdrop-blur-sm group"
		>
			<span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Home
		</button>
	);
};

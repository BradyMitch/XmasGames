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
			className="w-full px-6 py-3 border border-emerald-200 bg-white/80 text-emerald-900 font-semibold rounded-lg text-sm md:text-base shadow-sm hover:shadow-md hover:border-emerald-400 transition-all"
		>
			Back to home 🎄
		</button>
	);
};

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const ForgetCodeButton = () => {
	const [isClearing, setIsClearing] = useState(false);
	const router = useRouter();

	const handleClick = () => {
		if (isClearing) return;

		const confirmed = window.confirm(
			"Forget this profile code on this device?\n\nYou can still open this profile later using the code on another device.",
		);

		if (!confirmed) return;

		setIsClearing(true);

		try {
			localStorage.removeItem("xmas-games-2025-code");
		} catch {
			// ignore, nothing critical if this fails
		}

		// Send them back to home
		router.push("/");
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isClearing}
			className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-sky-800 shadow-sm hover:border-sky-400 hover:bg-sky-50 hover:text-sky-900 transition-colors disabled:opacity-60"
		>
			<span className="text-[13px]">🚪</span>
			<span>{isClearing ? "Leaving…" : "Leave this device"}</span>
		</button>
	);
};

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPasscodeForm() {
	const router = useRouter();
	const [passcode, setPasscode] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value.replace(/\D/g, "").slice(0, 6);
		setPasscode(newValue);

		// Auto-redirect when passcode is complete
		if (newValue.length === 6) {
			router.push(`/admin/profiles?passcode=${encodeURIComponent(newValue)}`);
		}
	};

	return (
		<div className="flex flex-col items-center gap-3">
			<input
				type="text"
				inputMode="numeric"
				value={passcode}
				onChange={handleChange}
				maxLength={6}
				placeholder="000000"
				className="w-40 text-center tracking-widest text-2xl font-mono font-bold text-emerald-900 px-4 py-2 rounded-lg border-2 border-emerald-200 bg-white/70 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
			/>

			<p className="text-xs text-emerald-700">6-digit passcode</p>
		</div>
	);
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const ExistingCodeInput = () => {
	const [value, setValue] = useState("");
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
		setValue(newValue);

		// Auto-redirect when code is complete
		if (newValue.length === 4) {
			router.push(`/profile/${newValue}`);
		}
	};

	return (
		<div className="flex flex-col items-center gap-3">
			<input
				type="text"
				value={value}
				onChange={handleChange}
				maxLength={4}
				placeholder="AB12"
				className="w-32 text-center tracking-widest text-xl font-mono font-bold text-emerald-900 px-4 py-2 rounded-lg border-2 border-emerald-200 bg-white/70 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
			/>

			<p className="text-xs text-emerald-700">4-letter code</p>
		</div>
	);
};

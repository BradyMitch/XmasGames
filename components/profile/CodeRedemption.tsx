"use client";

import { useState } from "react";
import { redeemCode } from "@/app/admin/actions";

interface CodeRedemptionProps {
	profileCode: string;
	onSuccess?: (newSpins: number) => void;
}

export default function CodeRedemption({ profileCode, onSuccess }: CodeRedemptionProps) {
	const [bonusCode, setBonusCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		if (!bonusCode.trim()) {
			setError("Please enter a code");
			return;
		}

		try {
			setLoading(true);
			const result = await redeemCode(profileCode, bonusCode.toUpperCase());
			setSuccess(true);
			setBonusCode("");
			onSuccess?.(result.spins);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to redeem code");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-50 px-6 py-7 md:px-8 md:py-9">
			{/* Header */}
			<div className="mb-5">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-1">
					Bonus codes
				</p>
				<h3 className="text-lg md:text-xl font-bold text-emerald-950">
					Redeem a bonus code for extra spins
				</h3>
				<p className="text-sm text-emerald-800/80 mt-2">
					Enter a 6-character code to unlock bonus spins and add them to your stash.
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div className="flex flex-col items-center gap-4">
					<input
						type="text"
						value={bonusCode}
						onChange={(e) => setBonusCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
						disabled={loading}
						maxLength={6}
						placeholder="ABCD12"
						className="w-40 text-center tracking-widest text-2xl font-mono font-bold text-emerald-900 px-4 py-2 rounded-lg border-2 border-emerald-200 bg-white/70 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
					/>
					<p className="text-xs text-emerald-700">6-character code</p>
					<button
						type="submit"
						disabled={loading || !bonusCode.trim()}
						className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Redeeming..." : "Redeem"}
					</button>
				</div>

				{/* Messages */}
				{error && (
					<div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm font-medium">
						{error}
					</div>
				)}

				{success && (
					<div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 text-sm font-medium">
						✨ Code redeemed successfully! Check your spins above.
					</div>
				)}
			</form>
		</div>
	);
}

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
		<div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 px-6 py-8 md:px-10 md:py-10 ring-1 ring-emerald-900/5">
			{/* Header */}
			<div className="mb-8 text-center">
				<div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-2xl mb-4 shadow-sm text-emerald-600">
					🎁
				</div>
				<h3 className="text-xl md:text-2xl font-black text-emerald-950 uppercase tracking-tight mb-2">
					Got a Bonus Code?
				</h3>
				<p className="text-sm font-medium text-emerald-800/60 max-w-md mx-auto leading-relaxed">
					Enter your 6-character code below to unlock extra spins instantly.
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="max-w-sm mx-auto">
				<div className="flex flex-col gap-4">
					<div className="relative group">
						<input
							type="text"
							value={bonusCode}
							onChange={(e) => setBonusCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
							disabled={loading}
							maxLength={6}
							placeholder="CODE12"
							className="w-full text-center tracking-[0.5em] text-2xl md:text-3xl font-mono font-black text-emerald-950 px-4 py-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 shadow-inner focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-emerald-900/10"
						/>
					</div>

					<button
						type="submit"
						disabled={loading || !bonusCode.trim()}
						className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm md:text-base"
					>
						{loading ? "Checking..." : "Redeem Code"}
					</button>
				</div>

				{/* Messages */}
				{error && (
					<div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 shadow-sm">
						{error}
					</div>
				)}

				{success && (
					<div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 shadow-sm">
						✨ Code redeemed! Spins added.
					</div>
				)}
			</form>
		</div>
	);
}

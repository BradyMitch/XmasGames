"use client";

import { useState } from "react";

interface CodeGeneratorProps {
	onCreate: (spins: number) => Promise<void>;
	isLoading: boolean;
}

export default function CodeGenerator({ onCreate, isLoading }: CodeGeneratorProps) {
	const [spins, setSpins] = useState<string>("10");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const spinsNum = parseInt(spins, 10);

		if (!spins || spinsNum < 1 || spinsNum > 100) {
			setError("Spins must be between 1 and 100");
			return;
		}

		try {
			await onCreate(spinsNum);
			setSpins("10");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create code");
		}
	};

	return (
		<div className="bg-white/80 backdrop-blur-md border border-white/70 rounded-lg p-6 shadow-sm">
			<h3 className="text-lg font-extrabold text-emerald-950 mb-4">Create New Code</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="spins" className="block text-sm font-semibold text-emerald-900 mb-2">
						Number of Spins
					</label>
					<input
						type="number"
						id="spins"
						min="1"
						max="100"
						value={spins}
						onChange={(e) => setSpins(e.target.value)}
						disabled={isLoading}
						className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
						placeholder="10"
					/>
				</div>

				{error && (
					<p className="text-sm text-red-800 bg-red-100 border border-red-300 rounded-lg p-3">
						{error}
					</p>
				)}

				<button
					type="submit"
					disabled={isLoading}
					className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "Creating..." : "Generate Code"}
				</button>
			</form>
		</div>
	);
}

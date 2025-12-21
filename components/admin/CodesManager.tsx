"use client";

import { useCallback, useEffect, useState } from "react";
import CodeCard from "@/components/admin/CodeCard";
import CodeGenerator from "@/components/admin/CodeGenerator";
import type { Code } from "@/types/tables/Code";


export default function CodesManager() {
	const [codes, setCodes] = useState<Code["Row"][]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	const [showGenerator, setShowGenerator] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	const fetchCodes = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/admin/codes`);
			if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch codes");
			const fetchedCodes = await res.json();
			setCodes(fetchedCodes);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch codes");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCodes();
	}, [fetchCodes]);

	const handleCreateCode = async (spins: number) => {
		try {
			setCreating(true);
			const res = await fetch(`/api/admin/codes`, {
				method: "POST",
				body: JSON.stringify({ spins }),
				headers: { "Content-Type": "application/json" },
			});
			if (!res.ok) throw new Error((await res.json()).error || "Failed to create code");
			await fetchCodes();
			setShowGenerator(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create code");
		} finally {
			setCreating(false);
		}
	};

	const handleDeleteCode = async (codeId: number) => {
		try {
			const res = await fetch(`/api/admin/codes?id=${codeId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error((await res.json()).error || "Failed to delete code");
			await fetchCodes();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete code");
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<h2 className="text-2xl font-bold text-emerald-950">Codes</h2>
				<button
					type="button"
					onClick={() => setShowGenerator(!showGenerator)}
					className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition shadow-md"
				>
					{showGenerator ? "Cancel" : "Create Code"}
				</button>
			</div>

			{showGenerator && (
				<div className="mb-8">
					<CodeGenerator onCreate={handleCreateCode} isLoading={creating} />
				</div>
			)}

			{error && (
				<div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
					{error}
				</div>
			)}

			{loading ? (
				<div className="text-center text-emerald-800">Loading codes...</div>
			) : codes.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-emerald-800/70 mb-4">No codes created yet</p>
					<button
						type="button"
						onClick={() => setShowGenerator(true)}
						className="text-emerald-600 hover:text-emerald-800 font-semibold"
					>
						Create your first code →
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{codes.map((code) => (
						<CodeCard key={code.id} code={code} onDelete={handleDeleteCode} />
					))}
				</div>
			)}
		</div>
	);
}

"use client";

import type { Code } from "@/types/tables/Code";

interface CodeCardProps {
	code: Code;
	onDelete: (codeId: string) => Promise<void>;
}

export default function CodeCard({ code, onDelete }: CodeCardProps) {
	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this code?")) {
			await onDelete(code.id);
		}
	};

	const formattedDate = new Date(code.created_at || "").toLocaleDateString();

	return (
		<div className="bg-white/80 backdrop-blur-md border border-white/70 rounded-lg p-4 hover:bg-white/90 transition-all duration-200 group shadow-sm">
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<p className="text-emerald-800/60 text-xs font-semibold mb-1 uppercase tracking-wide">
						Code
					</p>
					<p className="font-mono text-xl font-extrabold text-emerald-950 tracking-widest">
						{code.code}
					</p>
				</div>
				<button
					type="button"
					onClick={handleDelete}
					className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-all duration-200 opacity-0 group-hover:opacity-100"
					title="Delete code"
				>
					🗑️
				</button>
			</div>

			<div className="grid grid-cols-2 gap-2 mb-4">
				<div className="rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300/50 p-3">
					<p className="text-amber-800 text-xs font-semibold mb-1">SPINS</p>
					<p className="text-lg font-extrabold text-amber-950">{code.spins}</p>
				</div>

				<div
					className={`rounded-lg bg-gradient-to-br p-3 border ${
						code.redeemed
							? "from-red-100 to-red-200 border-red-300/50"
							: "from-emerald-100 to-emerald-200 border-emerald-300/50"
					}`}
				>
					<p
						className={`text-xs font-semibold mb-1 ${
							code.redeemed ? "text-red-800" : "text-emerald-800"
						}`}
					>
						STATUS
					</p>
					<p
						className={`text-lg font-extrabold ${
							code.redeemed ? "text-red-950" : "text-emerald-950"
						}`}
					>
						{code.redeemed ? "Used" : "Available"}
					</p>
				</div>
			</div>

			{code.redeemed && code.redeemed_by_name && (
				<div className="pt-3 border-t border-emerald-200">
					<p className="text-emerald-800/60 text-xs font-semibold mb-1 uppercase">Redeemed by</p>
					<p className="text-emerald-950 font-semibold">{code.redeemed_by_name}</p>
				</div>
			)}

			<p className="text-emerald-800/50 text-xs mt-3">{formattedDate}</p>
		</div>
	);
}

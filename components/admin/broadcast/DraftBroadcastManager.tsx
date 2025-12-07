"use client";

import { useState } from "react";
import { broadcastDraft, deleteDraftBroadcast } from "@/app/admin/broadcast/actions";
import type { DraftBroadcast } from "@/types/tables/DraftBroadcast";

interface DraftBroadcastManagerProps {
	initialDrafts: DraftBroadcast["Row"][];
	passcode: string;
}

export default function DraftBroadcastManager({
	initialDrafts,
	passcode,
}: DraftBroadcastManagerProps) {
	const [drafts, setDrafts] = useState<DraftBroadcast["Row"][]>(initialDrafts);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleDelete = async (id: number) => {
		if (!confirm("Delete this draft?")) return;

		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await deleteDraftBroadcast(id, passcode);
			setDrafts(drafts.filter((d) => d.id !== id));
			setSuccess("Draft deleted successfully!");
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete draft");
		} finally {
			setLoading(false);
		}
	};

	const handleBroadcast = async (id: number) => {
		if (!confirm("Broadcast this draft now?")) return;

		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			await broadcastDraft(id, passcode);
			setSuccess("Broadcast sent!");
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to broadcast");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-50 px-6 py-7 md:px-8 md:py-9">
			{/* Header */}
			<div className="mb-6">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-2">
					Manage Broadcasts
				</p>
				<h2 className="text-2xl font-bold text-emerald-950 mb-2">Saved Drafts</h2>
				<p className="text-sm text-emerald-800/80">
					View, send, or delete your saved broadcast drafts.
				</p>
			</div>

			{/* Messages */}
			{error && (
				<div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm font-medium mb-4">
					{error}
				</div>
			)}

			{success && (
				<div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 text-sm font-medium mb-4">
					✨ {success}
				</div>
			)}

			{/* Drafts List */}
			{drafts.length === 0 ? (
				<p className="text-emerald-700">No drafts saved yet.</p>
			) : (
				<div className="space-y-3">
					{drafts.map((draft) => (
						<div
							key={draft.id}
							className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start justify-between gap-4"
						>
							<div className="flex-1">
								<p className="text-emerald-950 font-medium">{draft.text}</p>
							</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => handleBroadcast(draft.id)}
									disabled={loading}
									className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-400 disabled:to-emerald-400 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap disabled:cursor-not-allowed"
								>
									{loading ? "..." : "Send Now"}
								</button>
								<button
									type="button"
									onClick={() => handleDelete(draft.id)}
									disabled={loading}
									className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap disabled:cursor-not-allowed"
								>
									{loading ? "..." : "Delete"}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

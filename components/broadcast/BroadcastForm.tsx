"use client";

import { useState } from "react";
import { saveDraftBroadcast } from "@/app/admin/broadcast/actions";
import { createBroadcast } from "@/app/broadcast/actions";

interface BroadcastFormProps {
	passcode: string;
}

export default function BroadcastForm({ passcode }: BroadcastFormProps) {
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleBroadcast = async () => {
		setError(null);
		setSuccess(null);

		if (!text.trim()) {
			setError("Please enter a broadcast message");
			return;
		}

		try {
			setLoading(true);
			await createBroadcast(text, passcode);
			setText("");
			setSuccess("Broadcast sent!");
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create broadcast");
		} finally {
			setLoading(false);
		}
	};

	const handleSaveDraft = async () => {
		setError(null);
		setSuccess(null);

		if (!text.trim()) {
			setError("Please enter a broadcast message");
			return;
		}

		try {
			setLoading(true);
			await saveDraftBroadcast(text, passcode);
			setText("");
			setSuccess("Draft saved!");
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save draft");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-50 px-6 py-7 md:px-8 md:py-9">
			{/* Header */}
			<div className="mb-6">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-2">
					New Announcement
				</p>
				<h2 className="text-2xl font-bold text-emerald-950 mb-2">Create Broadcast</h2>
				<p className="text-sm text-emerald-800/80">
					Send immediately or save as a draft for later.
				</p>
			</div>

			{/* Form */}
			<div className="space-y-4">
				<div>
					<label htmlFor="text" className="block text-sm font-semibold text-emerald-900 mb-2">
						Message
					</label>
					<textarea
						id="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						disabled={loading}
						maxLength={200}
						rows={4}
						placeholder="Enter your broadcast message..."
						className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-lg text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
					/>
					<p className="text-xs text-emerald-700/60 mt-1">{text.length}/200</p>
				</div>

				{/* Duration info */}
				<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
					<p className="text-sm text-emerald-900 font-medium">
						⏱️ Duration: <span className="font-bold">60 seconds</span>
					</p>
					<p className="text-xs text-emerald-800/70 mt-1">
						The broadcast will automatically disappear after one minute.
					</p>
				</div>

				{/* Messages */}
				{error && (
					<div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm font-medium">
						{error}
					</div>
				)}

				{success && (
					<div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 text-sm font-medium">
						✨ {success}
					</div>
				)}

				<div className="flex gap-3">
					<button
						type="button"
						onClick={handleBroadcast}
						disabled={loading || !text.trim()}
						className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Sending..." : "Broadcast Now"}
					</button>
					<button
						type="button"
						onClick={handleSaveDraft}
						disabled={loading || !text.trim()}
						className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Saving..." : "Save Draft"}
					</button>
				</div>
			</div>
		</div>
	);
}

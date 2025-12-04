"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import type { InstantWin } from "@/types/tables/InstantWin";

type InstantWinModalProps = {
	instantWin: InstantWin["Row"];
	imageUrl?: string;
	isOpen: boolean;
	onClose: () => void;
	onClaim: () => Promise<void>;
};

export const InstantWinModal = ({
	instantWin,
	imageUrl,
	isOpen,
	onClose,
	onClaim,
}: InstantWinModalProps) => {
	const isClaimingRef = useRef(false);

	const handleClaim = useCallback(async () => {
		if (isClaimingRef.current) return;
		isClaimingRef.current = true;

		try {
			await onClaim();
		} finally {
			isClaimingRef.current = false;
			onClose();
		}
	}, [onClaim, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_30px_60px_rgba(15,118,110,0.45)]">
				{/* Prize image */}
				{imageUrl && (
					<div className="mb-8 flex justify-center">
						<div className="relative">
							<div className="absolute inset-0 bg-amber-200 rounded-3xl blur-xl opacity-40 animate-pulse"></div>
							<div className="relative bg-white p-4 rounded-3xl shadow-lg border border-amber-100">
								<Image
									src={imageUrl}
									alt={instantWin.name}
									width={200}
									height={200}
									className="w-48 h-48 object-cover rounded-2xl"
								/>
							</div>
						</div>
					</div>
				)}

				{/* Prize details */}
				<div className="mb-8 text-center">
					<h2 className="text-3xl font-extrabold text-emerald-950 mb-2">{instantWin.name}</h2>
					{instantWin.value && (
						<p className="text-xl font-bold text-amber-600">${instantWin.value.toLocaleString()}</p>
					)}
				</div>

				{/* Message */}
				<div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-center">
					<p className="text-sm text-emerald-800 font-medium leading-relaxed">
						✨ Please show this screen to the party organizer to claim your prize before returning
						to the game.
					</p>
				</div>

				{/* Action button */}
				<button
					type="button"
					onClick={handleClaim}
					disabled={isClaimingRef.current}
					className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
				>
					{isClaimingRef.current ? "Processing..." : "Return to Game"}
				</button>
			</div>
		</div>
	);
};

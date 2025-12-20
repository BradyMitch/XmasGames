"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminPasscodeFormProps {
	redirectTo?: string;
}

export default function AdminPasscodeForm({
	redirectTo = "/admin/profiles",
}: AdminPasscodeFormProps) {
	const router = useRouter();
	const [passcode, setPasscode] = useState("");

	useEffect(() => {
		try {
			const stored = localStorage.getItem("admin-passcode");
			if (stored && /^\d{6}$/.test(stored)) {
				setPasscode(stored);
				router.push(`${redirectTo}?passcode=${encodeURIComponent(stored)}`);
			}
		} catch (e) {
			// ignore if localStorage not available
		}
	}, [redirectTo, router]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const key = e.key;
		// Backspace: remove last digit
		if (key === "Backspace") {
			e.preventDefault();
			setPasscode((p) => p.slice(0, -1));
			return;
		}

		// Allow numeric keys to append
		if (/^\d$/.test(key) && passcode.length < 6) {
			e.preventDefault();
			const newValue = `${passcode}${key}`;
			setPasscode(newValue);
			if (newValue.length === 6) {
				try {
					localStorage.setItem("admin-passcode", newValue);
				} catch (err) {
					// ignore
				}
				router.push(`${redirectTo}?passcode=${encodeURIComponent(newValue)}`);
			}
			return;
		}

		// Enter: if complete, submit
		if (key === "Enter") {
			e.preventDefault();
			if (passcode.length === 6) {
				router.push(`${redirectTo}?passcode=${encodeURIComponent(passcode)}`);
			}
			return;
		}

		// Allow navigation keys and tab by doing nothing
		if (key === "Tab" || key.startsWith("Arrow") || key === "Home" || key === "End") {
			return;
		}

		// Prevent other characters
		e.preventDefault();
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, 6 - passcode.length);
		if (!pasted) return;
		const newValue = (passcode + pasted).slice(0, 6);
		setPasscode(newValue);
		if (newValue.length === 6) {
			try {
				localStorage.setItem("admin-passcode", newValue);
			} catch (err) {
				// ignore
			}
			router.push(`${redirectTo}?passcode=${encodeURIComponent(newValue)}`);
		}
	};

	return (
		<div className="flex flex-col items-center gap-3">
			<input
				type="text"
				inputMode="numeric"
				value={"*".repeat(passcode.length)}
				onKeyDown={handleKeyDown}
				readOnly
				onPaste={handlePaste}
				maxLength={6}
				placeholder="000000"
				aria-label="Admin passcode"
				className="w-40 text-center tracking-widest text-2xl font-mono font-bold text-emerald-900 px-4 py-2 rounded-lg border-2 border-emerald-200 bg-white/70 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
			/>

			<p className="text-xs text-emerald-700">6-digit passcode</p>
		</div>
	);
}

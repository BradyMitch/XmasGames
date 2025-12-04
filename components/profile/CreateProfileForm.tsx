"use client";

import { useState } from "react";
import { AVATAR_EMOJIS, AVATAR_NAMES } from "@/utils/constants/avatars";

type Props = {
	createProfile: (formData: FormData) => Promise<void>;
};

export const CreateProfileForm = ({ createProfile }: Props) => {
	const [name, setName] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState("");
	const [nameError, setNameError] = useState("");

	const isNameValid = name.length >= 3 && name.length <= 20 && /^[a-zA-Z]+$/.test(name);
	const isFormValid = isNameValid && selectedAvatar !== "";

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setName(value);

		if (value.length === 0) {
			setNameError("");
		} else if (!/^[a-zA-Z]*$/.test(value)) {
			setNameError("Only letters allowed (no spaces or numbers).");
		} else if (value.length < 3) {
			setNameError("Name must be at least 3 characters.");
		} else if (value.length > 20) {
			setNameError("Name must be no more than 20 characters.");
		} else {
			setNameError("");
		}
	};

	const helperText =
		"3–20 letters only (no spaces or numbers). This is the name everyone will see tonight.";

	return (
		<div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 px-6 py-8 md:px-8 md:py-10 max-w-xl w-full ring-1 ring-emerald-900/5 relative overflow-hidden">
			{/* Decorative background gradient inside card */}
			<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

			{/* Card header */}
			<header className="mb-8 text-center relative">
				<p className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-4 shadow-sm">
					<span className="text-[10px] animate-pulse">●</span>
					Player profile
				</p>
				<h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-emerald-950 mb-2">
					Who&apos;s playing?
				</h2>
				<p className="text-sm font-medium text-emerald-800/70 leading-relaxed">
					Pick a name and a festive emoji so we know who to cheer for on the scoreboard.
				</p>
			</header>

			<form action={createProfile} className="space-y-8 relative">
				{/* Name Field */}
				<div>
					<label
						htmlFor="name"
						className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 ml-1"
					>
						Your name<span className="text-red-500 ml-0.5">*</span>
					</label>
					<div className="relative">
						<input
							type="text"
							id="name"
							name="name"
							placeholder="e.g. Holly, Frost, Blitzen"
							value={name}
							onChange={handleNameChange}
							className={`w-full px-5 py-3 pr-12 border rounded-2xl text-emerald-950 placeholder-emerald-800/30 text-base font-medium focus:outline-none transition-all shadow-sm ${
								nameError
									? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
									: "border-emerald-100 bg-white/50 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50"
							}`}
							maxLength={20}
							required
						/>
						<span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-emerald-400">
							{name.length}/20
						</span>
					</div>
					{nameError ? (
						<p className="text-xs font-bold text-red-500 mt-2 ml-1 flex items-center gap-1">
							<span>⚠️</span> {nameError}
						</p>
					) : (
						<p className="text-[11px] font-medium text-emerald-600/60 mt-2 ml-1">{helperText}</p>
					)}
				</div>

				{/* Emoji Picker */}
				<fieldset>
					<legend className="flex items-center justify-between mb-3 w-full">
						<span className="block text-xs font-bold uppercase tracking-wider text-emerald-900 ml-1">
							Choose your avatar<span className="text-red-500 ml-0.5">*</span>
						</span>
						{selectedAvatar && (
							<span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
								<span className="text-sm">{selectedAvatar}</span>
								<span>Selected</span>
							</span>
						)}
					</legend>

					<div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
						{AVATAR_EMOJIS.map((emoji: string, index: number) => {
							const id = `avatar-${AVATAR_NAMES[index]}`;
							const isSelected = selectedAvatar === emoji;

							return (
								<div key={emoji} className="relative group">
									<input
										type="radio"
										id={id}
										name="avatar"
										value={emoji}
										checked={isSelected}
										onChange={() => setSelectedAvatar(emoji)}
										className="sr-only peer"
										required
									/>
									<label
										htmlFor={id}
										className="flex flex-col items-center justify-center gap-1 text-center cursor-pointer p-3 rounded-2xl border border-emerald-100/80 bg-white/40 hover:border-emerald-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:shadow-lg peer-checked:ring-1 peer-checked:ring-emerald-500/20 peer-checked:-translate-y-0.5"
									>
										<span className="text-2xl md:text-3xl filter drop-shadow-sm transition-transform group-hover:scale-110 peer-checked:scale-110">
											{emoji}
										</span>
									</label>
								</div>
							);
						})}
					</div>
				</fieldset>

				{/* Preview + Submit */}
				<div className="pt-2">
					<button
						type="submit"
						disabled={!isFormValid}
						className={`w-full px-6 py-4 font-black uppercase tracking-widest rounded-full text-sm md:text-base shadow-lg transition-all duration-300 transform ${
							isFormValid
								? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-0.5 active:translate-y-0"
								: "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
						}`}
					>
						Create profile
					</button>
				</div>
			</form>
		</div>
	);
};

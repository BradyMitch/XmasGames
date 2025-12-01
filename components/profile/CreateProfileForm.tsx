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
		<div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-50 px-6 py-7 md:px-8 md:py-9 max-w-xl w-full">
			{/* Card header */}
			<header className="mb-6 md:mb-7 text-center">
				<p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 mb-3">
					<span className="text-[10px]">●</span>
					Player profile
				</p>
				<h2 className="text-lg md:text-xl font-extrabold text-emerald-950 mb-1">
					Who&apos;s playing?
				</h2>
				<p className="text-sm text-emerald-800/90">
					Pick a name and a festive emoji so we know who to cheer for on the scoreboard.
				</p>
			</header>

			<form action={createProfile} className="space-y-7">
				{/* Name Field */}
				<div>
					<label htmlFor="name" className="block text-sm font-semibold text-emerald-900 mb-2">
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
							className={`w-full px-4 py-2.5 pr-10 border-2 rounded-lg text-emerald-950 placeholder-emerald-300 text-sm md:text-base focus:outline-none transition-all ${
								nameError
									? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100"
									: "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
							}`}
							maxLength={20}
							required
						/>
						<span className="absolute inset-y-0 right-3 flex items-center text-xs text-emerald-500/70">
							{name.length}/20
						</span>
					</div>
					{nameError ? (
						<p className="text-xs text-red-600 mt-1">{nameError}</p>
					) : (
						<p className="text-[11px] text-emerald-700 mt-1">{helperText}</p>
					)}
				</div>

				{/* Emoji Picker */}
				<fieldset>
					<legend className="flex items-center justify-between mb-2">
						<span className="block text-sm font-semibold text-emerald-900">
							Choose your avatar emoji<span className="text-red-500 ml-0.5">*</span>
						</span>
						{selectedAvatar && (
							<span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
								<span className="text-base">{selectedAvatar}</span>
								<span>Selected</span>
							</span>
						)}
					</legend>

					<div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
						{AVATAR_EMOJIS.map((emoji: string, index: number) => {
							const id = `avatar-${AVATAR_NAMES[index]}`;
							const isSelected = selectedAvatar === emoji;

							return (
								<div key={emoji} className="relative">
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
										className="flex flex-col items-center justify-center gap-1 text-center cursor-pointer p-2 rounded-lg border-2 border-emerald-100 bg-white/70 hover:border-red-500 hover:bg-red-50/60 transition-all peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:shadow-md"
									>
										<span className="text-2xl md:text-3xl">{emoji}</span>
									</label>
								</div>
							);
						})}
					</div>
				</fieldset>

				{/* Preview + Submit */}
				<div className="space-y-4 pt-1">
					<button
						type="submit"
						disabled={!isFormValid}
						className={`w-full px-6 py-3 font-bold rounded-lg text-base md:text-lg shadow-lg transition-all transform ${
							isFormValid
								? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-xl hover:scale-105 cursor-pointer"
								: "bg-slate-300 text-slate-100 cursor-not-allowed shadow-none"
						}`}
					>
						Create profile 🎉
					</button>
				</div>
			</form>
		</div>
	);
};

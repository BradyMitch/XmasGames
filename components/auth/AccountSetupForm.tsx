"use client";

import { Forbidden2, TickCircle } from "iconsax-reactjs";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";

type Props = {
	isUsernameAvailable: (username: string) => Promise<boolean>;
	setupAccount: (formData: FormData) => Promise<void>;
	userId: string;
};

type UsernameStatus = "idle" | "checking" | "available" | "unavailable";

const useDebouncedValue = <T,>(value: T, delay: number): T => {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timeout);
	}, [value, delay]);

	return debouncedValue;
};

export const AccountSetupForm = ({ setupAccount, userId, isUsernameAvailable }: Props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState("");
	const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [country, setCountry] = useState("");
	const [stateProvince, setStateProvince] = useState("");
	const [city, setCity] = useState("");

	const debouncedUsername = useDebouncedValue(username, 500);

	const checkUsernameAvailability = useCallback(
		async (usernameToCheck: string) => {
			if (usernameToCheck.length < 3) {
				setUsernameStatus("idle");
				return;
			}

			setUsernameStatus("checking");
			try {
				const isAvailable = await isUsernameAvailable(usernameToCheck);
				setUsernameStatus(isAvailable ? "available" : "unavailable");
			} catch {
				setUsernameStatus("idle");
			}
		},
		[isUsernameAvailable],
	);

	useEffect(() => {
		if (!debouncedUsername) {
			setUsernameStatus("idle");
			return;
		}
		void checkUsernameAvailability(debouncedUsername);
	}, [debouncedUsername, checkUsernameAvailability]);

	const handleUsernameInput = (e: FormEvent<HTMLInputElement>) => {
		const input = e.currentTarget;
		let value = input.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
		if (value.length > 20) {
			value = value.slice(0, 20);
		}
		input.value = value;
		setUsername(value);
	};

	const handleNameInput = (e: FormEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value.replace(/[^a-zA-Z]/g, "");
		e.currentTarget.value = value;
		const fieldName = e.currentTarget.name;
		if (fieldName === "first_name") {
			setFirstName(value);
		} else if (fieldName === "last_name") {
			setLastName(value);
		}
	};

	const handleLocationInput = (e: FormEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value.replace(/[^a-zA-Z\s\-./&]/g, "").replace(/\s+/g, " ");
		e.currentTarget.value = value;
		const fieldName = e.currentTarget.name;
		if (fieldName === "country") {
			setCountry(value);
		} else if (fieldName === "state_province") {
			setStateProvince(value);
		} else if (fieldName === "city") {
			setCity(value);
		}
	};

	const isFormValid = (): boolean => {
		return (
			username.length >= 3 &&
			usernameStatus === "available" &&
			firstName.trim().length > 0 &&
			lastName.trim().length > 0 &&
			country.trim().length > 0 &&
			stateProvince.trim().length > 0 &&
			city.trim().length > 0
		);
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const formData = new FormData(e.currentTarget);
			formData.append("userId", userId);
			await setupAccount(formData);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const renderUsernameStatus = () => {
		switch (usernameStatus) {
			case "checking":
				return (
					<span className="absolute right-3 top-1/2 -translate-y-1/2">
						<span className="inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-gray-300 border-t-blue-500" />
					</span>
				);
			case "available":
				return (
					<span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-emerald-600 text-xs gap-1">
						<TickCircle size="16" color="#16a34a" />
					</span>
				);
			case "unavailable":
				return (
					<span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-red-600 text-xs gap-1">
						<Forbidden2 size="16" color="#ef4444" />
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className="w-full rounded-xl bg-surface-2 border border-surface-border shadow-lg">
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-surface-border/70">
				<div>
					<h2 className="text-base font-semibold text-typography-primary">Complete your profile</h2>
					<p className="text-xs text-typography-secondary">
						Choose a username and basic details to finish setting up your account.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="px-5 pb-4 pt-3 space-y-3">
				{error && (
					<div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
						{error}
					</div>
				)}

				{/* Username */}
				<div className="space-y-1">
					<label htmlFor="username" className="text-xs font-medium text-typography-primary">
						Username
					</label>
					<div className="relative">
						<input
							id="username"
							name="username"
							type="text"
							required
							maxLength={20}
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 pr-9 py-2 text-sm text-typography-primary shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
							placeholder="Create a username"
							disabled={isLoading}
							onInput={handleUsernameInput}
						/>
						{renderUsernameStatus()}
					</div>
					<p className="text-[11px] text-typography-secondary">
						3–20 characters. Letters, numbers, and underscores only.
					</p>
				</div>

				{/* Name */}
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					<div className="space-y-1">
						<label htmlFor="first_name" className="text-xs font-medium text-typography-primary">
							First name
						</label>
						<input
							id="first_name"
							name="first_name"
							type="text"
							required
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
							placeholder="First name"
							disabled={isLoading}
							onInput={handleNameInput}
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="last_name" className="text-xs font-medium text-typography-primary">
							Last name
						</label>
						<input
							id="last_name"
							name="last_name"
							type="text"
							required
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
							placeholder="Last name"
							disabled={isLoading}
							onInput={handleNameInput}
						/>
					</div>
				</div>

				{/* Location */}
				<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
					<div className="space-y-1">
						<label htmlFor="country" className="text-xs font-medium text-typography-primary">
							Country
						</label>
						<input
							id="country"
							name="country"
							type="text"
							required
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
							placeholder="Country"
							disabled={isLoading}
							onInput={handleLocationInput}
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="state_province" className="text-xs font-medium text-typography-primary">
							Province / State
						</label>
						<input
							id="state_province"
							name="state_province"
							type="text"
							required
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
							placeholder="Province / State"
							disabled={isLoading}
							onInput={handleLocationInput}
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="city" className="text-xs font-medium text-typography-primary">
							City
						</label>
						<input
							id="city"
							name="city"
							type="text"
							required
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
							placeholder="City"
							disabled={isLoading}
							onInput={handleLocationInput}
						/>
					</div>
				</div>

				{/* Preferences */}
				<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
					<div className="space-y-1">
						<label
							htmlFor="temperature_preference"
							className="text-xs font-medium text-typography-primary"
						>
							Temperature Preference
						</label>
						<select
							id="temperature_preference"
							name="temperature_preference"
							defaultValue="celsius"
							disabled={isLoading}
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
						>
							<option value="celsius">Celsius (°C)</option>
							<option value="fahrenheit">Fahrenheit (°F)</option>
						</select>
					</div>

					<div className="space-y-1">
						<label
							htmlFor="weight_unit_preference"
							className="text-xs font-medium text-typography-primary"
						>
							Weight Preference
						</label>
						<select
							id="weight_unit_preference"
							name="weight_unit_preference"
							defaultValue="metric"
							disabled={isLoading}
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
						>
							<option value="metric">Metric (g / kg)</option>
							<option value="imperial">Imperial (lb)</option>
						</select>
					</div>

					<div className="space-y-1">
						<label
							htmlFor="length_unit_preference"
							className="text-xs font-medium text-typography-primary"
						>
							Length Preference
						</label>
						<select
							id="length_unit_preference"
							name="length_unit_preference"
							defaultValue="metric"
							disabled={isLoading}
							className="w-full rounded-lg border border-surface-border bg-surface-1 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
						>
							<option value="metric">Metric (mm / cm)</option>
							<option value="imperial">Imperial (in / ft)</option>
						</select>
					</div>
				</div>

				{/* Visibility + submit */}
				<div className="flex flex-col gap-3 border-t border-surface-border/70 pt-3 mt-1">
					<div className="flex flex-wrap gap-3">
						<label className="flex items-start gap-2 text-xs text-typography-primary">
							<input
								id="show_name"
								name="show_name"
								type="checkbox"
								defaultChecked
								className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								disabled={isLoading}
							/>
							<span>
								<span className="font-medium">Show full name</span>
								<span className="block text-[11px] text-typography-secondary">
									To appear on your public profile.
								</span>
							</span>
						</label>

						<label className="flex items-start gap-2 text-xs text-typography-primary">
							<input
								id="show_location"
								name="show_location"
								type="checkbox"
								defaultChecked
								className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								disabled={isLoading}
							/>
							<span>
								<span className="font-medium">Show location</span>
								<span className="block text-[11px] text-typography-secondary">
									To appear on your public profile.
								</span>
							</span>
						</label>
					</div>

					<button type="submit" disabled={isLoading || !isFormValid()} className="primary w-full">
						{isLoading ? "Saving..." : "Save and continue"}
					</button>
				</div>
			</form>
		</div>
	);
};

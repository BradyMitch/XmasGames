"use client";

import type { User } from "@supabase/supabase-js";
import { Eye, EyeSlash, TickCircle } from "iconsax-reactjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
	updatePasswordForEmail: (newPassword: string) => Promise<User | null>;
};

export const UpdatePasswordForm = ({ updatePasswordForEmail }: Props) => {
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const router = useRouter();

	const validatePassword = (password: string): string | null => {
		if (password.length < 8) {
			return "Password must be at least 8 characters long.";
		}
		if (!/(?=.*[a-z])/.test(password)) {
			return "Password must contain at least one lowercase letter.";
		}
		if (!/(?=.*[A-Z])/.test(password)) {
			return "Password must contain at least one uppercase letter.";
		}
		// Must contain either a number OR a special character
		if (!/(?=.*[\d!@#$%^&*()_+\-=[\]{}|~.,?])/.test(password)) {
			return "Password must contain at least one number or special character.";
		}
		// Only allow letters, numbers, and specified special characters
		if (!/^[a-zA-Z\d!@#$%^&*()_+\-=[\]{}|~.,?]+$/.test(password)) {
			return "Password contains invalid characters. Only letters, numbers, and these special characters are allowed: !@#$%^&*()_+-=[]{}|~.,?";
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		// Validation
		const passwordError = validatePassword(password);
		if (passwordError) {
			setError(passwordError);
			setIsLoading(false);
			return;
		}

		try {
			await updatePasswordForEmail(password);
			setIsSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (!isLoading) {
				const form = (e.currentTarget as HTMLInputElement).form;
				if (form) {
					const formEvent = new Event("submit", { cancelable: true, bubbles: true });
					form.dispatchEvent(formEvent);
				}
			}
		}
	};

	if (isSuccess) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="bg-surface-2 rounded-lg shadow-md p-8 border border-surface-border">
					<div className="text-center">
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<TickCircle size="32" className="text-green-600" variant="Bold" />
						</div>
						<h1 className="text-2xl font-bold mb-4 text-typography-primary">Password Updated!</h1>
						<p className="text-typography-secondary mb-6">
							Your password has been successfully updated. You can now sign in with your new
							password.
						</p>
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => {
									router.push("/auth/sign-in");
									router.refresh();
								}}
								className="primary w-full"
							>
								Continue to Sign In
							</button>
							<button
								type="button"
								onClick={() => {
									router.push("/");
									router.refresh();
								}}
								className="secondary w-full"
							>
								Go to Homepage
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-surface-2 rounded-lg shadow-md p-8 border border-surface-border">
				<h1 className="text-2xl font-bold text-center mb-2 text-typography-primary">
					Update Password
				</h1>
				<p className="text-typography-secondary text-center mb-6">
					Enter your new password below. It must meet the security requirements shown.
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-typography-primary mb-1"
						>
							New Password
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyDown={handlePasswordKeyDown}
								required
								minLength={8}
								className="w-full px-3 py-2 pr-10 bg-surface-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter your new password"
								disabled={isLoading}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 top-1 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none bg-transparent"
								disabled={isLoading}
							>
								{showPassword ? (
									<EyeSlash size="20" variant="Outline" />
								) : (
									<Eye size="20" variant="Outline" />
								)}
							</button>
						</div>
						<div className="mt-1">
							<p className="text-xs text-typography-secondary">
								Password must be at least 8 characters with uppercase, lowercase, and either a
								number or special character (!@#$%^&*()_+-=[]{}|~.,?).
							</p>
						</div>
					</div>

					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<button type="submit" disabled={isLoading} className="primary w-full">
						{isLoading ? "Updating..." : "Update Password"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-typography-secondary">
						Remember your current password?{" "}
						<a href="/auth/sign-in" className="underline font-semibold">
							Sign in instead
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

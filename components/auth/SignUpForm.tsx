"use client";

import type { User } from "@supabase/supabase-js";
import { Eye, EyeSlash } from "iconsax-reactjs";
import { useEffect, useState } from "react";

type Props = {
	emailSignUp: (email: string, password: string) => Promise<User | null>;
	initialEmail?: string;
};

export const SignUpForm = ({ emailSignUp, initialEmail }: Props) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Set initial email from URL params if provided
	useEffect(() => {
		if (initialEmail) {
			setEmail(initialEmail);
		}
	}, [initialEmail]);

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
			await emailSignUp(email, password);
			setSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmailKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const passwordInput = document.getElementById("password");
			passwordInput?.focus();
		}
	};

	const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (!isLoading) {
				const form = e.currentTarget.form;
				if (form) {
					const formEvent = new Event("submit", { cancelable: true, bubbles: true });
					form.dispatchEvent(formEvent);
				}
			}
		}
	};

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="bg-surface-2 rounded-lg shadow-md p-8 border border-surface-border">
					<h1 className="text-2xl font-bold text-center mb-6 text-typography-primary">
						Check Your Email
					</h1>

					<div className="mb-6 p-4 bg-success-light border border-success rounded-md">
						<p className="text-sm text-success text-center">
							We've sent you a confirmation email at <strong>{email}</strong>. Please check your
							inbox and click the link to activate your account.
						</p>
					</div>

					<div className="text-center">
						<p className="text-sm text-typography-secondary mb-4">
							Didn't receive the email? Check your spam folder or try signing up again.
						</p>
						<button
							type="button"
							onClick={() => setSuccess(false)}
							className="text-sm text-typography-secondary hover:text-typography-primary hover:underline"
						>
							Back to Sign Up
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-surface-2 rounded-lg shadow-md p-8 border border-surface-border">
				<h1 className="text-2xl font-bold text-center mb-6 text-typography-primary">Sign Up</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-typography-primary mb-1"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={handleEmailKeyDown}
							required
							className="w-full px-3 py-2 bg-surface-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Enter your email"
							disabled={isLoading}
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-typography-primary mb-1"
						>
							Password
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyDown={handlePasswordKeyDown}
								required
								className="w-full px-3 py-2 pr-10 bg-surface-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter your password"
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

					<button type="submit" disabled={isLoading} className="primary w-full">
						{isLoading ? "Creating account..." : "Sign Up"}
					</button>

					<div className="mt-4 text-center">
						<p className="text-xs text-typography-secondary">
							By continuing, you agree to World of Citrus'{" "}
							<a href="/terms" className="underline">
								Terms of Service
							</a>{" "}
							and{" "}
							<a href="/privacy" className="underline">
								Privacy Policy
							</a>
							.
						</p>
					</div>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-typography-secondary">
						Already have an account?{" "}
						<a
							href={email ? `/auth/sign-in?email=${encodeURIComponent(email)}` : "/auth/sign-in"}
							className="underline font-semibold"
						>
							Sign in
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

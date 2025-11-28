"use client";

import type { User } from "@supabase/supabase-js";
import { Eye, EyeSlash, InfoCircle } from "iconsax-reactjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "@/styles/components/checkbox.css";

type Props = {
	signInWithEmail: (email: string, password: string) => Promise<User | null>;
	initialEmail?: string;
	redirectUrl?: string;
};

export const SignInForm = ({ signInWithEmail, initialEmail, redirectUrl }: Props) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	// Load saved email on component mount
	useEffect(() => {
		// Priority: initialEmail from URL params > saved email from localStorage
		if (initialEmail) {
			setEmail(initialEmail);
		} else {
			const savedEmail = localStorage.getItem("woc_saved_email");
			if (savedEmail) {
				setEmail(savedEmail);
				setRememberMe(true);
			}
		}
	}, [initialEmail]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await signInWithEmail(email, password);

			// Handle remember me functionality
			if (rememberMe) {
				localStorage.setItem("woc_saved_email", email);
			} else {
				localStorage.removeItem("woc_saved_email");
			}

			const destination = redirectUrl || "/";
			router.push(destination);
			router.refresh();
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

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-surface-2 rounded-lg shadow-md p-8 border border-surface-border">
				<h1 className="text-2xl font-bold text-center mb-6 text-typography-primary">Sign In</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
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
						<label htmlFor="password" className="text-sm font-medium text-typography-primary">
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
					</div>

					<div className="flex items-center justify-between py-2">
						<div className="flex items-center space-x-2">
							<input
								id="remember-me"
								type="checkbox"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
							/>
							<label
								htmlFor="remember-me"
								className="text-sm text-typography-primary flex items-center space-x-1"
							>
								<span>Remember me</span>
								<div className="relative group">
									<InfoCircle
										size="16"
										className="text-typography-secondary cursor-help"
										variant="Outline"
									/>
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
										Save your email address for future sign-ins
										<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
									</div>
								</div>
							</label>
						</div>
						<a
							href="/auth/reset-password"
							className="text-sm text-typography-secondary hover:text-typography-primary hover:underline"
						>
							Forgot Password?
						</a>
					</div>

					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<button type="submit" disabled={isLoading} className="primary w-full">
						{isLoading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-typography-secondary">
						Don't have an account?{" "}
						<a
							href={email ? `/auth/register?email=${encodeURIComponent(email)}` : "/auth/register"}
							className="underline font-semibold"
						>
							Sign up
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

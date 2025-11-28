"use client";

import { InfoCircle, TickCircle } from "iconsax-reactjs";
import { useState } from "react";

type Props = {
	resetPasswordForEmail: (email: string) => Promise<void>;
	initialEmail?: string;
};

export const ForgotPasswordForm = ({ resetPasswordForEmail, initialEmail }: Props) => {
	const [email, setEmail] = useState(initialEmail || "");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await resetPasswordForEmail(email);
			setIsSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmailKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (!isLoading && !isSuccess) {
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
						<h1 className="text-2xl font-bold mb-4 text-typography-primary">Check Your Email</h1>
						<p className="text-typography-secondary mb-6">
							We've sent a password reset link to <strong>{email}</strong>. Click the link in the
							email to reset your password.
						</p>
						<div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
							<div className="flex items-start space-x-2">
								<InfoCircle
									size="20"
									className="text-blue-600 mt-0.5 flex-shrink-0"
									variant="Bold"
								/>
								<div className="text-sm text-blue-800">
									<p className="font-medium mb-1">Didn't receive the email?</p>
									<ul className="list-disc list-inside space-y-1 text-blue-700">
										<li>Check your spam or junk folder</li>
										<li>Make sure the email address is correct</li>
										<li>Wait a few minutes for the email to arrive</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => {
									setIsSuccess(false);
									setEmail("");
									setError(null);
								}}
								className="secondary w-full"
							>
								Try Another Email
							</button>
							<a
								href="/auth/sign-in"
								className="text-sm text-typography-secondary hover:text-typography-primary hover:underline block text-center"
							>
								Back to Sign In
							</a>
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
					Forgot Password?
				</h1>
				<p className="text-typography-secondary text-center mb-6">
					Enter your email address and we'll send you a link to reset your password.
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-typography-primary mb-1"
						>
							Email Address
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={handleEmailKeyDown}
							required
							className="w-full px-3 py-2 bg-surface-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Enter your email address"
							disabled={isLoading}
						/>
					</div>

					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<button type="submit" disabled={isLoading} className="primary w-full">
						{isLoading ? "Sending..." : "Send Reset Link"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-typography-secondary">
						Remember your password?{" "}
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

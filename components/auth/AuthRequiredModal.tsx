"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

export const AuthRequiredModal = ({ isOpen, onClose }: Props) => {
	const [isVisible, setIsVisible] = useState(isOpen);

	useEffect(() => {
		setIsVisible(isOpen);
	}, [isOpen]);

	const handleClose = () => {
		setIsVisible(false);
		onClose();
	};

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 z-40">
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 bg-black w-full h-full p-0 m-0 border-0 cursor-pointer"
				style={{ opacity: 0.4 }}
				onClick={handleClose}
				aria-label="Close modal"
			/>

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-1 rounded-lg shadow-lg z-50 p-6 space-y-4">
				<h2 className="text-xl font-bold text-typography-primary">Become a Member</h2>

				<p className="text-typography-secondary">
					This interaction requires you to become a member of our community. Create a new account or
					sign in to your existing account to get started.
				</p>

				<div className="flex flex-col gap-3 pt-4">
					<button type="button" className="primary w-full">
						<Link href="/auth/register" onClick={handleClose}>
							Sign Up
						</Link>
					</button>

					<span className="text-center text-typography-secondary">
						Already have an account?{" "}
						<Link
							href="/auth/sign-in"
							className="text-typography-secondary underline font-semibold"
							onClick={handleClose}
						>
							Sign In
						</Link>
					</span>
				</div>

				<button type="button" onClick={handleClose} className="w-full tertiary">
					Dismiss
				</button>
			</div>
		</div>
	);
};

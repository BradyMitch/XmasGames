import Link from "next/link";

export const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="mt-auto border-t border-surface-border bg-surface-1 px-8 py-6">
			<div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
				{/* Left side - Copyright */}
				<div className="text-center text-sm text-typography-secondary sm:text-left">
					© {currentYear} World of Citrus. All rights reserved.
				</div>

				{/* Right side - Links */}
				<div className="flex items-center gap-6 text-sm">
					<Link
						href="/terms"
						className="text-typography-secondary hover:text-typography-primary transition-colors"
					>
						Terms
					</Link>
					<Link
						href="/privacy"
						className="text-typography-secondary hover:text-typography-primary transition-colors"
					>
						Privacy
					</Link>
					<Link
						href="/about"
						className="text-typography-secondary hover:text-typography-primary transition-colors"
					>
						About
					</Link>
				</div>
			</div>
		</footer>
	);
};

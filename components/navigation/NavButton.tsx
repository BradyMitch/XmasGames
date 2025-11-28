"use client";

import { Logout } from "iconsax-reactjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type NavButtonItem = {
	label: string;
	href: string;
	newTab?: boolean;
	icon?: React.ReactNode;
};

export type ThemeOption = "system" | "light" | "dark";

export type Props = {
	icon: React.ReactNode;
	items?: NavButtonItem[];
	ariaLabel?: string;
	classNames?: string;
	showThemeSelector?: boolean;
	showAccountSettings?: boolean;
};

export const NavButton = ({
	icon,
	items = [],
	ariaLabel = "Menu",
	classNames = "",
	showThemeSelector = false,
	showAccountSettings = false,
}: Props) => {
	const [open, setOpen] = useState(false);
	const [currentTheme, setCurrentTheme] = useState<ThemeOption>("system");
	const hasItems = Array.isArray(items) && items.length > 0;

	// Delay close slightly to avoid flicker when moving between trigger and menu
	const closeTimer = useRef<number | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	const clearCloseTimer = useCallback(() => {
		if (closeTimer.current) {
			window.clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	}, []);

	const onOpen = useCallback(() => {
		clearCloseTimer();
		setOpen(true);
	}, [clearCloseTimer]);

	const onClose = useCallback(() => {
		clearCloseTimer();
		closeTimer.current = window.setTimeout(() => {
			setOpen(false);
		}, 120);
	}, [clearCloseTimer]);

	const onToggle = useCallback(() => {
		setOpen(!open);
	}, [open]);

	// Keep open while focus is inside (keyboard)
	const onBlurCapture = useCallback((e: React.FocusEvent) => {
		// If the next focused element is outside the root, close.
		if (rootRef.current && !rootRef.current.contains(e.relatedTarget as Node)) {
			setOpen(false);
		}
	}, []);

	// Theme management functions
	const applyTheme = useCallback((theme: ThemeOption) => {
		const html = document.documentElement;

		// Remove existing theme classes
		html.classList.remove("light", "dark");

		if (theme === "light") {
			html.classList.add("light");
		} else if (theme === "dark") {
			html.classList.add("dark");
		}
		// For "system", we don't add any class and let CSS media queries handle it
	}, []);

	const handleThemeChange = useCallback(
		(theme: ThemeOption) => {
			setCurrentTheme(theme);
			localStorage.setItem("woc_theme", theme);
			applyTheme(theme);
		},
		[applyTheme],
	);

	// Load theme from localStorage on mount
	useEffect(() => {
		const savedTheme = localStorage.getItem("woc_theme") as ThemeOption;
		if (savedTheme && ["system", "light", "dark"].includes(savedTheme)) {
			setCurrentTheme(savedTheme);
			applyTheme(savedTheme);
		}
	}, [applyTheme]);

	const navClassNames = `relative ${classNames}`;

	const buttonClasses =
		"inline-flex items-center justify-center p-2 rounded-md text-sm font-medium " +
		"text-typography-primary hover:text-typography-secondary hover:bg-surface-2/60 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
		"focus-visible:ring-primary-500 transition-colors cursor-pointer " +
		"border border-surface-3";

	const menuItemClasses =
		"block w-full text-left px-3 py-2 rounded-[6px] text-sm font-medium " +
		"focus:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:bg-surface-2 " +
		"text-typography-primary hover:text-typography-secondary";

	const themeItemClasses =
		"flex items-center justify-between w-full text-left px-3 py-2 rounded-[6px] text-sm font-medium " +
		"focus:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:bg-surface-2 " +
		"text-typography-primary hover:text-typography-secondary cursor-pointer";

	const themeOptions: { value: ThemeOption; label: string }[] = [
		{ value: "system", label: "System" },
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
	];

	if (!hasItems && !showThemeSelector) {
		return null;
	}

	return (
		<nav
			ref={rootRef}
			className={navClassNames}
			onFocusCapture={onOpen}
			onBlurCapture={onBlurCapture}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					setOpen(false);
					triggerRef.current?.focus();
				}
			}}
		>
			{/* Button trigger */}
			<button
				ref={triggerRef}
				type="button"
				className={buttonClasses}
				onClick={onToggle}
				onMouseEnter={onOpen}
				onMouseLeave={onClose}
				onFocus={onOpen}
				onBlur={onBlurCapture}
				aria-label={ariaLabel}
				aria-expanded={open}
				aria-haspopup="true"
			>
				{icon}
			</button>

			{/* Dropdown menu */}
			<div
				role="menu"
				aria-label={ariaLabel}
				data-open={open}
				className="absolute right-0 top-[50px] z-50 min-w-[12rem] rounded-lg border border-surface-3 bg-surface-2 shadow-elevation p-2 transition-opacity data-[open=false]:pointer-events-none data-[open=false]:opacity-0 data-[open=true]:opacity-100"
				onMouseEnter={onOpen}
				onMouseLeave={onClose}
			>
				{/* Navigation items */}
				{hasItems && (
					<ul className="m-0 list-none p-0">
						{items.map((item) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className={menuItemClasses}
									role="menuitem"
									{...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									onClick={() => setOpen(false)}
								>
									<span className="inline-flex items-center gap-2">
										{item.icon && <span className="flex-shrink-0">{item.icon}</span>}
										<span>{item.label}</span>
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}

				{/* Divider */}
				{hasItems && showThemeSelector && <div className="my-2 h-px bg-surface-border" />}

				{/* Theme selector */}
				{showThemeSelector && (
					<div>
						<div className="px-3 py-2 text-xs font-medium text-typography-secondary uppercase tracking-wider">
							Theme
						</div>
						<ul className="m-0 list-none p-0">
							{themeOptions.map((option) => (
								<li key={option.value}>
									<button
										type="button"
										className={themeItemClasses}
										role="menuitem"
										onClick={() => {
											handleThemeChange(option.value);
											setOpen(false);
										}}
									>
										<span>{option.label}</span>
										<span className="flex items-center">
											{currentTheme === option.value && (
												<div className="w-2 h-2 bg-typography-primary rounded-full" />
											)}
										</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</nav>
	);
};

"use client";

import { ArrowDown2, ArrowUp2 } from "iconsax-reactjs";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type NavChild = {
	label: string;
	href: string;
	newTab?: boolean;
	icon?: React.ReactNode;
};

export type Props = {
	label: string;
	href: string;
	items?: NavChild[];
};

export const NavLink = ({ label, href, items }: Props) => {
	const [open, setOpen] = useState(false);
	const hasMenu = Array.isArray(items) && items.length > 0;

	const closeTimer = useRef<number | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const firstItemRef = useRef<HTMLAnchorElement | null>(null);

	const menuId = useMemo(() => {
		return `menu-${label.replace(/\s+/g, "-").toLowerCase()}`;
	}, [label]);

	const clearCloseTimer = useCallback(() => {
		if (closeTimer.current) {
			window.clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	}, []);

	const openMenu = useCallback(() => {
		clearCloseTimer();
		setOpen(true);
	}, [clearCloseTimer]);

	const scheduleClose = useCallback(() => {
		clearCloseTimer();
		closeTimer.current = window.setTimeout(() => {
			setOpen(false);
		}, 120);
	}, [clearCloseTimer]);

	// Hover support
	const onMouseEnter = hasMenu ? openMenu : undefined;
	const onMouseLeave = hasMenu ? scheduleClose : undefined;

	// Robust focus-out detector: close only if focus actually left the root (after it settles)
	const onBlurCapture = useCallback(() => {
		if (!hasMenu) return;
		requestAnimationFrame(() => {
			const active = document.activeElement;
			if (rootRef.current && active && rootRef.current.contains(active)) {
				return;
			}
			setOpen(false);
		});
	}, [hasMenu]);

	// Keyboard on trigger
	const onTriggerKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLButtonElement>) => {
			if (!hasMenu) return;

			if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				if (!open) setOpen(true);
				requestAnimationFrame(() => {
					firstItemRef.current?.focus();
				});
			} else if (e.key === "Escape") {
				e.preventDefault();
				setOpen(false);
			} else if (e.key === "Tab" && open && !e.shiftKey) {
				// Move focus into the submenu on Tab from trigger when open
				e.preventDefault();
				requestAnimationFrame(() => {
					firstItemRef.current?.focus();
				});
			}
		},
		[hasMenu, open],
	);

	// Keyboard inside menu
	const onMenuKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (!open) return;
			if (e.key === "Escape") {
				e.preventDefault();
				setOpen(false);
				requestAnimationFrame(() => {
					triggerRef.current?.focus();
				});
			}
		},
		[open],
	);

	useEffect(() => {
		return () => clearCloseTimer();
	}, [clearCloseTimer]);

	const triggerClasses =
		"inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium " +
		"text-typography-primary hover:text-typography-secondary hover:bg-surface-2/60 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
		"focus-visible:ring-primary-500 focus-visible:ring-offset-[var(--surface-1)] " +
		"transition-colors";

	const menuItemClasses =
		"block w-full text-left px-3 py-2 rounded-[6px] text-sm font-medium " +
		"focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 " +
		"focus-visible:ring-offset-[var(--surface-2)] focus:bg-surface-2 " +
		"hover:bg-surface-2 text-typography-primary hover:text-typography-secondary";

	return (
		<nav
			ref={rootRef}
			className="relative"
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onFocusCapture={hasMenu ? openMenu : undefined}
			onBlurCapture={hasMenu ? onBlurCapture : undefined}
		>
			<div className="inline-flex items-center">
				{hasMenu ? (
					<button
						ref={triggerRef}
						type="button"
						className={triggerClasses}
						aria-haspopup="menu"
						aria-expanded={open}
						aria-controls={menuId}
						onKeyDown={onTriggerKeyDown}
					>
						<span>{label}</span>
						<span>
							{open ? (
								<ArrowUp2 size={14} variant="Outline" />
							) : (
								<ArrowDown2 size={14} variant="Outline" />
							)}
						</span>
					</button>
				) : (
					<Link href={href} className={triggerClasses}>
						<span>{label}</span>
					</Link>
				)}
			</div>

			{hasMenu && (
				<div
					id={menuId}
					role="menu"
					aria-label={`${label} submenu`}
					aria-hidden={!open}
					data-open={open}
					className="absolute left-0 top-[50px] z-50 min-w-[12rem] rounded-lg border border-surface-3 shadow-elevation bg-surface-2 p-2 transition-opacity data-[open=false]:pointer-events-none data-[open=false]:opacity-0 data-[open=true]:opacity-100"
					onMouseEnter={openMenu}
					onMouseLeave={scheduleClose}
					onKeyDown={onMenuKeyDown}
				>
					<ul className="m-0 list-none p-0">
						{items.map((it, idx) => (
							<li key={it.href}>
								<Link
									href={it.href}
									ref={idx === 0 ? firstItemRef : undefined}
									className={menuItemClasses}
									role="menuitem"
									tabIndex={open ? 0 : -1}
									{...(it.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									onClick={() => setOpen(false)}
								>
									<span className="inline-flex items-center gap-2">
										{it.icon && <span className="flex-shrink-0">{it.icon}</span>}
										<span>{it.label}</span>
									</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</nav>
	);
};

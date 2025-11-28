"use client";

import { HamburgerMenu, Lifebuoy, People, ProfileCircle, Setting2, Tag } from "iconsax-reactjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavButton } from "./NavButton";
import { NavLink } from "./NavLink";

export const Header = () => {
	const pathname = usePathname();
	return (
		<header className="sticky z-100 top-0 flex item-center justify-between mx-auto w-full h-[var(--header-height)] border-b border-surface-border bg-surface-1 px-8 py-3 shadow-sm">
			{/* Left side */}
			<div className="flex items-center justify-between gap-5">
				{/* Logo and Title */}
				<Link href="/">
					<div className="flex items-center justify-between gap-1">
						<Image src="/logo.png" alt="Xmas Games Logo" width={24} height={24} />
						<h1 className="text-md font-semibold text-typography-primary">Xmas Games</h1>
					</div>
				</Link>
			</div>

			{/* Right side */}
			<div className="flex items-center justify-between gap-3">
				{/* Menu (md-lg) */}
				<NavButton
					classNames="hidden md:block"
					icon={<HamburgerMenu size={20} />}
					ariaLabel="Options menu"
					showThemeSelector
				/>
				{/* Menu (sm) */}
				<NavButton
					classNames="block md:hidden"
					icon={<HamburgerMenu size={20} />}
					ariaLabel="Options menu"
					showThemeSelector
				/>
			</div>
		</header>
	);
};

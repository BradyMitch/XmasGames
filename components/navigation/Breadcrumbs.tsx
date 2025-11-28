import { ArrowRight2 } from "iconsax-reactjs";
import Link from "next/link";

export type Breadcrumb = {
	title: string;
	path: string;
};

type Props = {
	items: Breadcrumb[];
};

export const Breadcrumbs = ({ items }: Props) => {
	if (items.length === 0) {
		return null;
	}

	return (
		<nav aria-label="Breadcrumb" className="mb-4">
			<ol className="flex items-center space-x-1 text-sm">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<li key={`${item.path}-${index}`} className="flex items-center">
							{index > 0 && (
								<ArrowRight2
									size={14}
									className="mr-1 text-[var(--typography-secondary)]"
									aria-hidden="true"
								/>
							)}
							{isLast ? (
								<span className="text-[var(--typography-primary)] font-medium" aria-current="page">
									{item.title}
								</span>
							) : (
								<Link
									href={item.path}
									className="text-[var(--typography-secondary)] hover:text-[var(--typography-primary)] transition-colors"
								>
									{item.title}
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

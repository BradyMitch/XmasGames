export const Buttons = () => {
	return (
		<section className="col-span-12 w-full">
			<h2 className="text-2xl font-semibold text-typography-primary mb-2 p-2">Buttons</h2>
			<p className="text-typography-secondary mb-6 p-2">
				Try hover, focus, and active states (use keyboard navigation to test accessibility).
			</p>

			<div className="w-full overflow-x-auto rounded-lg border border-surface-border bg-surface-2 shadow-sm">
				<table className="min-w-full border-collapse text-sm">
					<thead>
						<tr className="bg-surface-1 border-b border-surface-border text-left text-typography-secondary">
							<th className="p-4 font-semibold w-[20%]">Type</th>
							<th className="p-4 font-semibold w-[20%]">Default</th>
							<th className="p-4 font-semibold w-[20%]">Small</th>
							<th className="p-4 font-semibold w-[20%]">Danger</th>
							<th className="p-4 font-semibold w-[20%]">Disabled</th>
						</tr>
					</thead>
					<tbody>
						{["primary", "secondary", "tertiary"].map((type) => (
							<tr key={type} className="even:bg-surface-1 border-b border-surface-border">
								<td className="p-4 font-medium text-typography-primary capitalize">{type}</td>

								{/* Default */}
								<td className="p-4">
									<button type="button" className={type}>
										{type[0].toUpperCase() + type.slice(1)}
									</button>
								</td>

								{/* Small */}
								<td className="p-4">
									<button type="button" className={`${type} small`}>
										Small
									</button>
								</td>

								{/* Danger */}
								<td className="p-4">
									<button type="button" className={`${type} danger`}>
										Danger
									</button>
								</td>

								{/* Disabled */}
								<td className="p-4">
									<button type="button" className={type} disabled>
										Disabled
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
};

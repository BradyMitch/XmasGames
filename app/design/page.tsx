import { Buttons } from "@/components/design/Buttons";

export default function Page() {
	return (
		<div className="grid grid-cols-12 gap-4 mx-8 my-4 overflow-x-hidden">
			<div className="col-span-12">
				<h1 className="text-2xl font-bold">Design System</h1>
			</div>
			<Buttons />
		</div>
	);
}

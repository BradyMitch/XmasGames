import { redirect } from "next/navigation";

export default function Page() {
	// Redirect to profile/create if no code, or to the code-based slots route
	redirect("/");
}

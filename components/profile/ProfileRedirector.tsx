"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProfileRedirector = () => {
	const router = useRouter();

	useEffect(() => {
		const code = localStorage.getItem("xmas-games-2025-code");

		if (code) {
			router.push(`/profile/${code}`);
		} else {
			router.push("/profile/create");
		}
	}, [router]);

	return null;
};

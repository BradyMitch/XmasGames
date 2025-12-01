"use client";

import { useEffect } from "react";

type LocalStorageSyncProps = {
	code: string;
};

export const LocalStorageSync = ({ code }: LocalStorageSyncProps) => {
	useEffect(() => {
		localStorage.setItem("xmas-games-2025-code", code);
	}, [code]);

	return null;
};

import { Geist, Roboto } from "next/font/google";
import "@/styles/globals.css";
import BroadcastProvider from "@/components/BroadcastProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const roboto = Roboto({
	variable: "--font-roboto",
	subsets: ["latin"],
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${roboto.variable} antialiased min-h-screen flex flex-col`}
			>
				<BroadcastProvider />
				<main className="flex-1">{children}</main>
			</body>
		</html>
	);
}

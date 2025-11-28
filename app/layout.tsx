import { Geist, Roboto } from "next/font/google";
import "@/styles/globals.css";
import { Footer } from "@/components/navigation/Footer";
import { Header } from "@/components/navigation/Header";

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
				<Header />
				<main className="min-h-[calc(100vh-50px)] mx-8 mt-4 flex-1">{children}</main>
				<Footer />
			</body>
		</html>
	);
}

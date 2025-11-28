import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/^https?:\/\//, ""),
			},
		],
	},
};

export default nextConfig;

import { ProfileRedirector } from "@/components/profile/ProfileRedirector";

export default function Page() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
			{/* Snowflake decorations */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-20 left-10 text-4xl opacity-20 animate-pulse">❄️</div>
				<div
					className="absolute top-40 right-20 text-5xl opacity-15 animate-pulse"
					style={{ animationDelay: "1s" }}
				>
					❄️
				</div>
				<div
					className="absolute bottom-32 left-1/4 text-4xl opacity-20 animate-pulse"
					style={{ animationDelay: "2s" }}
				>
					❄️
				</div>
			</div>

			{/* Loading screen */}
			<div className="text-center relative z-10">
				<div className="text-6xl mb-4 animate-bounce">🎄</div>
				<h1 className="text-3xl font-bold text-green-900 mb-2">Loading your profile...</h1>
				<p className="text-green-700">Get ready to have some festive fun!</p>
			</div>

			{/* Client-side redirector */}
			<ProfileRedirector />
		</div>
	);
}

"use client";

import { useEffect, useState } from "react";
import { addSpinsToProfile, getAllProfiles } from "@/app/admin/actions";
import type { Profile } from "@/types/tables/Profile";
import ProfileCard from "./ProfileCard";

interface ProfilesManagerProps {
	passcode: string;
}

export default function ProfilesManager({ passcode }: ProfilesManagerProps) {
	const [profiles, setProfiles] = useState<Profile["Row"][]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchProfiles = async () => {
			try {
				setIsLoading(true);
				const data = await getAllProfiles(passcode);
				setProfiles(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load profiles");
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfiles();
	}, [passcode]);

	const handleAddSpins = async (profileId: number, spinsToAdd: number) => {
		try {
			await addSpinsToProfile(profileId, spinsToAdd, passcode);

			// Update local state
			setProfiles((prevProfiles) =>
				prevProfiles.map((profile) =>
					profile.id === profileId ? { ...profile, spins: profile.spins + spinsToAdd } : profile,
				),
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add spins");
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<p className="text-gray-600 text-lg">Loading profiles...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-800 font-semibold">Error: {error}</p>
			</div>
		);
	}

	if (profiles.length === 0) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p className="text-yellow-800">No profiles found.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{profiles.map((profile) => (
				<ProfileCard key={profile.id} profile={profile} onAddSpins={handleAddSpins} />
			))}
		</div>
	);
}

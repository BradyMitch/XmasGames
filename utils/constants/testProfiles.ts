import { AVATAR_EMOJIS } from "./avatars";

const TEST_NAMES = [
	"Holly",
	"Frost",
	"Blitzen",
	"Jingle",
	"Sparkle",
	"Aurora",
	"Evergreen",
	"Snowdrop",
	"Tinsel",
	"Mistletoe",
];

export function generateTestProfiles() {
	return TEST_NAMES.map((name, index) => ({
		id: index,
		name,
		avatar: AVATAR_EMOJIS[index % AVATAR_EMOJIS.length],
		tickets: Math.floor(Math.random() * 101) + 50, // 50-150
		spins: 0,
		code: `TEST${index}`,
		created_at: new Date().toISOString(),
	}));
}

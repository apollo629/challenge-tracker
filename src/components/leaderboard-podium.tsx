import Link from "next/link";

type PodiumEntry = {
  rank: number;
  name: string;
  value: number;
  userId: string;
  challengeId?: string;
};

const medals = ["🥇", "🥈", "🥉"];
const podiumColors = [
  "from-yellow-400/20 to-yellow-500/5 border-yellow-400/50",
  "from-gray-300/20 to-gray-400/5 border-gray-300/50",
  "from-amber-600/20 to-amber-700/5 border-amber-600/50",
];
const podiumHeights = ["h-36", "h-28", "h-24"];
const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd

export function LeaderboardPodium({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) return null;

  // Pad to 3 entries if fewer
  const padded = [...entries];
  while (padded.length < 3) {
    padded.push({ rank: padded.length + 1, name: "—", value: 0, userId: "" });
  }

  return (
    <div className="flex items-end justify-center gap-3 py-4">
      {podiumOrder.map((idx) => {
        const entry = padded[idx];
        const isPlaceholder = entry.userId === "";
        const href = entry.challengeId
          ? `/users/${entry.userId}/challenges/${entry.challengeId}`
          : `/users/${entry.userId}`;

        return (
          <div key={idx} className="flex flex-col items-center gap-2 w-28">
            <span className="text-3xl">{medals[idx]}</span>
            {isPlaceholder ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              <Link href={href} className="text-sm font-semibold hover:underline text-center truncate w-full">
                {entry.name}
              </Link>
            )}
            <div
              className={`w-full ${podiumHeights[idx]} rounded-t-lg bg-gradient-to-t border-t-2 ${podiumColors[idx]} flex items-center justify-center`}
            >
              <span className="text-lg font-bold">
                {entry.value > 0 ? entry.value.toLocaleString() : ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

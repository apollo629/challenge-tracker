import Link from "next/link";

type ListEntry = {
  rank: number;
  name: string;
  value: number;
  userId: string;
  challengeId?: string;
};

export function LeaderboardList({
  entries,
  maxValue,
}: {
  entries: ListEntry[];
  maxValue: number;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const pct = maxValue > 0 ? (entry.value / maxValue) * 100 : 0;
        const href = entry.challengeId
          ? `/users/${entry.userId}/challenges/${entry.challengeId}`
          : `/users/${entry.userId}`;

        return (
          <div
            key={entry.userId}
            className="flex items-center gap-3 rounded-lg border px-3 py-2"
          >
            <span className="text-sm font-medium text-muted-foreground w-8 text-right">
              #{entry.rank}
            </span>
            <Link
              href={href}
              className="text-sm font-medium hover:underline w-28 truncate"
            >
              {entry.name}
            </Link>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-semibold w-20 text-right">
              {entry.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

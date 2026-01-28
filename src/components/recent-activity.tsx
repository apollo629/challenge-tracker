import { formatDistanceToNow } from "date-fns";

type Activity = {
  id: string;
  userName: string;
  userId: string;
  challengeTitle?: string;
  challengeId?: string;
  value: number;
  createdAt: string;
};

export function RecentActivity({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No recent activity yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {activity.userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.userName}</span>{" "}
              logged{" "}
              <span className="font-semibold">
                {activity.value.toLocaleString()}
              </span>
              {activity.challengeTitle && (
                <span className="text-muted-foreground">
                  {" "}
                  in {activity.challengeTitle}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

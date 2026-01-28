import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LeaderboardPodium } from "@/components/leaderboard-podium";
import { LeaderboardList } from "@/components/leaderboard-list";
import { RecentActivity } from "@/components/recent-activity";

async function getActiveChallenges() {
  const now = new Date();

  return prisma.challenge.findMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { endDate: "asc" },
  });
}

async function getStats() {
  const [userCount, teamCount, challengeCount] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.challenge.count(),
  ]);

  return { userCount, teamCount, challengeCount };
}

async function getLeaderboard(challengeId: string) {
  const participants = await prisma.progressLog.groupBy({
    by: ["userId"],
    where: { challengeId },
    _sum: { value: true },
    orderBy: { _sum: { value: "desc" } },
  });

  const userIds = participants.map((p) => p.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });

  return participants.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    name: users.find((u) => u.id === p.userId)?.name ?? "Unknown",
    value: p._sum.value || 0,
    challengeId,
  }));
}

async function getRecentActivity() {
  const logs = await prisma.progressLog.findMany({
    include: { user: true, challenge: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return logs.map((log) => ({
    id: log.id,
    userName: log.user.name,
    userId: log.userId,
    challengeTitle: log.challenge.title,
    challengeId: log.challengeId,
    value: log.value,
    createdAt: log.createdAt.toISOString(),
  }));
}

export default async function Home() {
  const [activeChallenges, stats, recentActivity] = await Promise.all([
    getActiveChallenges(),
    getStats(),
    getRecentActivity(),
  ]);

  const leaderboards = await Promise.all(
    activeChallenges.map((c) => getLeaderboard(c.id))
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Challenge Tracker. Manage challenges, teams, and track
          progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.challengeCount}</div>
            <p className="text-xs text-muted-foreground">
              {activeChallenges.length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamCount}</div>
            <p className="text-xs text-muted-foreground">Competing together</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">
              Tracking their progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Active Challenges
          </h2>
          <Link href="/challenges">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {activeChallenges.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No active challenges at the moment.
              </p>
              <div className="flex justify-center mt-4">
                <Link href="/challenges/new">
                  <Button>Create Challenge</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {challenge.title}
                      </CardTitle>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <CardDescription>
                      {format(new Date(challenge.startDate), "MMM d")} -{" "}
                      {format(new Date(challenge.endDate), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {activeChallenges.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {activeChallenges.map((challenge, i) => {
              const lb = leaderboards[i];
              if (lb.length === 0) return null;
              const top3 = lb.slice(0, 3);
              const rest = lb.slice(3);
              const maxValue = lb[0]?.value ?? 0;

              return (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {challenge.title} Leaderboard
                      </CardTitle>
                      <Link href={`/challenges/${challenge.id}/leaderboard`}>
                        <Button variant="outline" size="sm">
                          Full Leaderboard
                        </Button>
                      </Link>
                    </div>
                    <CardDescription>
                      {lb.length} participants competing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeaderboardPodium entries={top3} />
                    {rest.length > 0 && (
                      <div className="mt-4">
                        <LeaderboardList entries={rest} maxValue={maxValue} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest progress updates</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={recentActivity} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

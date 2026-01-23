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

export default async function Home() {
  const [activeChallenges, stats] = await Promise.all([
    getActiveChallenges(),
    getStats(),
  ]);

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
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

async function getChallenges() {
  const challenges = await prisma.challenge.findMany({
    include: {
      _count: {
        select: {
          progressLogs: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const now = new Date();

  return challenges.map((challenge) => {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    let status: "upcoming" | "active" | "past";

    if (now < start) {
      status = "upcoming";
    } else if (now > end) {
      status = "past";
    } else {
      status = "active";
    }

    return { ...challenge, status };
  });
}

function ChallengeCard({
  challenge,
}: {
  challenge: Awaited<ReturnType<typeof getChallenges>>[0];
}) {
  const statusColors = {
    active: "bg-green-500",
    upcoming: "bg-blue-500",
    past: "bg-gray-500",
  };

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
            <Badge className={statusColors[challenge.status]}>
              {challenge.status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {challenge.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {format(new Date(challenge.startDate), "MMM d")} -{" "}
              {format(new Date(challenge.endDate), "MMM d, yyyy")}
            </span>
            <span>{challenge._count.progressLogs} logs</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  const activeChallenges = challenges.filter((c) => c.status === "active");
  const upcomingChallenges = challenges.filter((c) => c.status === "upcoming");
  const pastChallenges = challenges.filter((c) => c.status === "past");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">
            Create and manage your challenges
          </p>
        </div>
        <Link href="/challenges/new">
          <Button>Create Challenge</Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastChallenges.length})</TabsTrigger>
          <TabsTrigger value="all">All ({challenges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeChallenges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No active challenges. Create one to get started!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingChallenges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No upcoming challenges.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastChallenges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No past challenges.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {challenges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No challenges yet. Create your first challenge!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

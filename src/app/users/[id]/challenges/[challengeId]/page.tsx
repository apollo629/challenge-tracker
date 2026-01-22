import { notFound } from "next/navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

async function getUserChallengeProgress(userId: string, challengeId: string) {
  const [user, challenge, progressLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.challenge.findUnique({ where: { id: challengeId } }),
    prisma.progressLog.findMany({
      where: { userId, challengeId },
      orderBy: { date: "desc" },
    }),
  ]);

  return { user, challenge, progressLogs };
}

type PageProps = {
  params: Promise<{ id: string; challengeId: string }>;
};

export default async function UserChallengeProgressPage({ params }: PageProps) {
  const { id: userId, challengeId } = await params;
  const { user, challenge, progressLogs } =
    await getUserChallengeProgress(userId, challengeId);

  if (!user || !challenge) {
    notFound();
  }

  // Calculate total and average
  const totalValue = progressLogs.reduce((sum, log) => sum + log.value, 0);
  const avgValue =
    progressLogs.length > 0 ? totalValue / progressLogs.length : 0;

  // Determine challenge status
  const now = new Date();
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

  const statusColors = {
    active: "bg-green-500",
    upcoming: "bg-blue-500",
    past: "bg-gray-500",
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/users/${userId}`}>
          <Button variant="outline" size="sm">
            ← Back to {user.name}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{user.name}&apos;s Progress</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{challenge.title}</span>
                <Badge className={statusColors[status]}>{status}</Badge>
              </CardDescription>
            </div>
            <Link href={`/challenges/${challengeId}/log`}>
              <Button>Log Progress</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                {totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{avgValue.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Daily Average</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{progressLogs.length}</p>
              <p className="text-sm text-muted-foreground">Days Logged</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Challenge period: {format(start, "MMM d, yyyy")} -{" "}
            {format(end, "MMM d, yyyy")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress History</CardTitle>
          <CardDescription>Chronological log of daily progress</CardDescription>
        </CardHeader>
        <CardContent>
          {progressLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No progress logged yet for this challenge.
              </p>
              <Link href={`/challenges/${challengeId}/log`}>
                <Button>Log First Entry</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.date), "EEEE, MMMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {log.value.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

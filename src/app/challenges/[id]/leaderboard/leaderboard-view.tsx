"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type IndividualEntry = {
  rank: number;
  userId: string;
  userName: string;
  totalValue: number;
};

type TeamEntry = {
  rank: number;
  teamId: string;
  teamName: string;
  memberCount: number;
  averageValue: number;
  totalValue: number;
};

type IndividualLeaderboard = {
  challengeId: string;
  challengeTitle: string;
  leaderboard: IndividualEntry[];
};

type TeamLeaderboard = {
  challengeId: string;
  challengeTitle: string;
  leaderboard: TeamEntry[];
};

export function LeaderboardView({
  challengeId,
  challengeTitle,
}: {
  challengeId: string;
  challengeTitle: string;
}) {
  const [individualData, setIndividualData] =
    useState<IndividualLeaderboard | null>(null);
  const [teamData, setTeamData] = useState<TeamLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError("");

      try {
        const [individualRes, teamRes] = await Promise.all([
          fetch(`/api/challenges/${challengeId}/leaderboard/individual`),
          fetch(`/api/challenges/${challengeId}/leaderboard/teams`),
        ]);

        if (!individualRes.ok || !teamRes.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const [individual, team] = await Promise.all([
          individualRes.json(),
          teamRes.json(),
        ]);

        setIndividualData(individual);
        setTeamData(team);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [challengeId]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/challenges/${challengeId}`}>
          <Button variant="outline" size="sm">
            ← Back to Challenge
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>{challengeTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading leaderboard...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Tabs defaultValue="individual">
              <TabsList>
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="mt-4">
                {individualData?.leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">
                    No participants have logged progress yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">
                          Total Progress
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {individualData?.leaderboard.map((entry) => (
                        <TableRow key={entry.userId}>
                          <TableCell className="font-medium">
                            {entry.rank === 1
                              ? "1"
                              : entry.rank === 2
                              ? "2"
                              : entry.rank === 3
                              ? "3"
                              : entry.rank}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/users/${entry.userId}/challenges/${challengeId}`}
                              className="hover:underline"
                            >
                              {entry.userName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.totalValue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="teams" className="mt-4">
                {teamData?.leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">
                    No teams have members with logged progress yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">Members</TableHead>
                        <TableHead className="text-right">Avg/Member</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamData?.leaderboard.map((entry) => (
                        <TableRow key={entry.teamId}>
                          <TableCell className="font-medium">
                            {entry.rank === 1
                              ? "1"
                              : entry.rank === 2
                              ? "2"
                              : entry.rank === 3
                              ? "3"
                              : entry.rank}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/teams/${entry.teamId}`}
                              className="hover:underline"
                            >
                              {entry.teamName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.memberCount}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.averageValue.toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.totalValue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

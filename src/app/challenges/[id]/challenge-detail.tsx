"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { JoinChallengeDialog } from "./join-challenge-dialog";
import { LeaderboardPodium } from "@/components/leaderboard-podium";
import { LeaderboardList } from "@/components/leaderboard-list";
import { RecentActivity } from "@/components/recent-activity";

type Activity = {
  id: string;
  userName: string;
  userId: string;
  value: number;
  createdAt: string;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  status: "upcoming" | "active" | "past";
  participants: {
    userId: string;
    totalValue: number;
    user: {
      id: string;
      name: string;
    };
  }[];
};

export function ChallengeDetail({
  challenge,
  recentActivity,
}: {
  challenge: Challenge;
  recentActivity: Activity[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: challenge.title,
    description: challenge.description,
    startDate: format(new Date(challenge.startDate), "yyyy-MM-dd"),
    endDate: format(new Date(challenge.endDate), "yyyy-MM-dd"),
  });

  const statusColors = {
    active: "bg-green-500",
    upcoming: "bg-blue-500",
    past: "bg-gray-500",
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/challenges/${challenge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update challenge");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/challenges/${challenge.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete challenge");
      }

      router.push("/challenges");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  // Sort participants by total value descending
  const sortedParticipants = [...challenge.participants].sort(
    (a, b) => b.totalValue - a.totalValue
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/challenges">
          <Button variant="outline" size="sm">
            ← Back to Challenges
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            {isEditing ? (
              <CardTitle>Edit Challenge</CardTitle>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CardTitle>{challenge.title}</CardTitle>
                  <Badge className={statusColors[challenge.status]}>
                    {challenge.status}
                  </Badge>
                </div>
                <CardDescription>
                  {format(new Date(challenge.startDate), "MMMM d, yyyy")} -{" "}
                  {format(new Date(challenge.endDate), "MMMM d, yyyy")}
                </CardDescription>
              </>
            )}
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              {challenge.status !== "past" && (
                <JoinChallengeDialog challengeId={challenge.id} />
              )}
              <Link href={`/challenges/${challenge.id}/log`}>
                <Button variant="outline">Log Progress</Button>
              </Link>
              <Link href={`/challenges/${challenge.id}/leaderboard`}>
                <Button variant="outline">Leaderboard</Button>
              </Link>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{challenge.title}
                      &quot;? This will also remove all progress logs for this
                      challenge. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    min={formData.startDate}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      title: challenge.title,
                      description: challenge.description,
                      startDate: format(
                        new Date(challenge.startDate),
                        "yyyy-MM-dd"
                      ),
                      endDate: format(
                        new Date(challenge.endDate),
                        "yyyy-MM-dd"
                      ),
                    });
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{challenge.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  {challenge.participants.length} participants
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {sortedParticipants.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No participants have logged progress yet.
                </p>
              ) : (
                <>
                  <LeaderboardPodium
                    entries={sortedParticipants.slice(0, 3).map((p, i) => ({
                      rank: i + 1,
                      name: p.user.name,
                      value: p.totalValue,
                      userId: p.userId,
                      challengeId: challenge.id,
                    }))}
                  />
                  {sortedParticipants.length > 3 && (
                    <div className="mt-4">
                      <LeaderboardList
                        entries={sortedParticipants.slice(3).map((p, i) => ({
                          rank: i + 4,
                          name: p.user.name,
                          value: p.totalValue,
                          userId: p.userId,
                          challengeId: challenge.id,
                        }))}
                        maxValue={sortedParticipants[0]?.totalValue ?? 0}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest progress updates</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={recentActivity} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

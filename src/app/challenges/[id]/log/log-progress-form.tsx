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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
};

type User = {
  id: string;
  name: string;
};

export function LogProgressForm({
  challenge,
  users,
}: {
  challenge: Challenge;
  users: User[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");
  const startDate = format(new Date(challenge.startDate), "yyyy-MM-dd");
  const endDate = format(new Date(challenge.endDate), "yyyy-MM-dd");

  // Determine the default date (today if within range, otherwise start date)
  const todayDate = new Date();
  const challengeStart = new Date(challenge.startDate);
  const challengeEnd = new Date(challenge.endDate);

  let defaultDate = today;
  if (todayDate < challengeStart) {
    defaultDate = startDate;
  } else if (todayDate > challengeEnd) {
    defaultDate = endDate;
  }

  const [formData, setFormData] = useState({
    userId: "",
    date: defaultDate,
    value: "",
  });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          challengeId: challenge.id,
          date: formData.date,
          value: parseFloat(formData.value),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to log progress");
      }

      const selectedUser = users.find((u) => u.id === formData.userId);
      setSuccess(
        `Progress logged for ${selectedUser?.name} on ${format(new Date(formData.date), "MMM d, yyyy")}`
      );
      setFormData({ ...formData, value: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/challenges/${challenge.id}`}>
          <Button variant="outline" size="sm">
            ← Back to Challenge
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Log Progress</CardTitle>
            <Badge className={statusColors[status]}>{status}</Badge>
          </div>
          <CardDescription>
            {challenge.title}
            <br />
            {format(new Date(challenge.startDate), "MMM d")} -{" "}
            {format(new Date(challenge.endDate), "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                No users available. Create a user first.
              </p>
              <Link href="/users/new">
                <Button>Create User</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, userId: value })
                  }
                >
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={startDate}
                  max={endDate}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Must be within the challenge date range
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Progress Value</Label>
                <Input
                  id="value"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder="e.g., 10000 (steps), 30 (pages)"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  If an entry exists for this user and date, the value will be
                  added to it
                </p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.userId}
                >
                  {isLoading ? "Logging..." : "Log Progress"}
                </Button>
                <Link href={`/challenges/${challenge.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

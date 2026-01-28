"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  name: string;
};

export function JoinChallengeDialog({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [name, setName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && mode === "existing") {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch(() => setError("Failed to load users"));
    }
  }, [open, mode]);

  async function handleNewUser(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create user");
      }

      const user = await response.json();
      setOpen(false);
      router.push(`/challenges/${challengeId}/log?userId=${user.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleExistingUser(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(`/challenges/${challengeId}/log?userId=${selectedUserId}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setError("");
          setName("");
          setSelectedUserId("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg">Join Challenge</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Challenge</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("new");
              setError("");
            }}
          >
            I&apos;m new
          </Button>
          <Button
            variant={mode === "existing" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("existing");
              setError("");
            }}
          >
            I have an account
          </Button>
        </div>

        {mode === "new" ? (
          <form onSubmit={handleNewUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Join"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleExistingUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="existingUser">Select Your Name</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="existingUser">
                  <SelectValue placeholder="Select your name" />
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
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              disabled={!selectedUserId}
              className="w-full"
            >
              Join
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

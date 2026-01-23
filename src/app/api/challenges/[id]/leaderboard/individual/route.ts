import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/challenges/[id]/leaderboard/individual - Get individual leaderboard (SUM per user, ranked)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Get all progress logs for this challenge, grouped by user with SUM
    const leaderboard = await prisma.progressLog.groupBy({
      by: ["userId"],
      where: { challengeId: id },
      _sum: { value: true },
      orderBy: { _sum: { value: "desc" } },
    });

    // Get user details for each entry
    const userIds = leaderboard.map((entry) => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    // Build ranked leaderboard
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      userName: userMap.get(entry.userId)?.name || "Unknown",
      totalValue: entry._sum.value || 0,
    }));

    return NextResponse.json({
      challengeId: id,
      challengeTitle: challenge.title,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error("Failed to fetch individual leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch individual leaderboard" },
      { status: 500 }
    );
  }
}

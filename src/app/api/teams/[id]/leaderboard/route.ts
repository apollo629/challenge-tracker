import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/teams/[id]/leaderboard - Get internal team leaderboard (members ranked by progress)
// Requires challengeId query parameter
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json(
        { error: "challengeId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (team.members.length === 0) {
      return NextResponse.json({
        teamId: id,
        teamName: team.name,
        challengeId,
        challengeTitle: challenge.title,
        leaderboard: [],
      });
    }

    // Get progress totals for each team member
    const memberStats = await Promise.all(
      team.members.map(async (member) => {
        const result = await prisma.progressLog.aggregate({
          where: {
            challengeId,
            userId: member.userId,
          },
          _sum: { value: true },
        });

        return {
          userId: member.userId,
          userName: member.user.name,
          totalValue: result._sum.value || 0,
        };
      })
    );

    // Sort by total value descending and add ranks
    const rankedMembers = memberStats
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((member, index) => ({
        rank: index + 1,
        ...member,
      }));

    return NextResponse.json({
      teamId: id,
      teamName: team.name,
      challengeId,
      challengeTitle: challenge.title,
      leaderboard: rankedMembers,
    });
  } catch (error) {
    console.error("Failed to fetch team internal leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch team internal leaderboard" },
      { status: 500 }
    );
  }
}

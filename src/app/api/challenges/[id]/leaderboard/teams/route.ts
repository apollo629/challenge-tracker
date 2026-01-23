import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/challenges/[id]/leaderboard/teams - Get team leaderboard (AVG of member totals per team)
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

    // Get all teams with their members
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    // For each team, calculate the average of member totals
    const teamStats = await Promise.all(
      teams.map(async (team) => {
        if (team.members.length === 0) {
          return {
            teamId: team.id,
            teamName: team.name,
            memberCount: 0,
            averageValue: 0,
            totalValue: 0,
          };
        }

        // Get progress totals for each team member
        const memberTotals = await Promise.all(
          team.members.map(async (member) => {
            const result = await prisma.progressLog.aggregate({
              where: {
                challengeId: id,
                userId: member.userId,
              },
              _sum: { value: true },
            });
            return result._sum.value || 0;
          })
        );

        const totalValue = memberTotals.reduce((sum, val) => sum + val, 0);
        const averageValue = totalValue / team.members.length;

        return {
          teamId: team.id,
          teamName: team.name,
          memberCount: team.members.length,
          averageValue,
          totalValue,
        };
      })
    );

    // Filter out teams with no members and sort by average value descending
    const rankedTeams = teamStats
      .filter((team) => team.memberCount > 0)
      .sort((a, b) => b.averageValue - a.averageValue)
      .map((team, index) => ({
        rank: index + 1,
        ...team,
      }));

    return NextResponse.json({
      challengeId: id,
      challengeTitle: challenge.title,
      leaderboard: rankedTeams,
    });
  } catch (error) {
    console.error("Failed to fetch team leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch team leaderboard" },
      { status: 500 }
    );
  }
}

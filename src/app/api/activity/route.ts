import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/activity - Get recent progress logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get("challengeId");

    const where: { challengeId?: string } = {};
    if (challengeId) where.challengeId = challengeId;

    const logs = await prisma.progressLog.findMany({
      where,
      include: {
        user: true,
        challenge: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const activities = logs.map((log) => ({
      id: log.id,
      userName: log.user.name,
      userId: log.userId,
      challengeTitle: log.challenge.title,
      challengeId: log.challengeId,
      value: log.value,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

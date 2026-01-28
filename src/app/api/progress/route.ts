import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProgressSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  challengeId: z.string().min(1, "Challenge ID is required"),
  date: z.string().transform((str) => {
    const date = new Date(str);
    date.setHours(0, 0, 0, 0);
    return date;
  }),
  value: z.number().min(0, "Value must be non-negative"),
});

// GET /api/progress - Get progress logs with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const challengeId = searchParams.get("challengeId");

    if (!userId && !challengeId) {
      return NextResponse.json(
        { error: "Either userId or challengeId is required" },
        { status: 400 }
      );
    }

    const where: { userId?: string; challengeId?: string } = {};
    if (userId) where.userId = userId;
    if (challengeId) where.challengeId = challengeId;

    const progressLogs = await prisma.progressLog.findMany({
      where,
      include: {
        user: true,
        challenge: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(progressLogs);
  } catch (error) {
    console.error("Failed to fetch progress logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress logs" },
      { status: 500 }
    );
  }
}

// POST /api/progress - Create or update (upsert) a progress log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProgressSchema.parse(body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify challenge exists and get its date range
    const challenge = await prisma.challenge.findUnique({
      where: { id: validated.challengeId },
    });
    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Validate date is within challenge range
    const logDate = validated.date;
    const startDate = new Date(challenge.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(challenge.endDate);
    endDate.setHours(23, 59, 59, 999);

    if (logDate < startDate || logDate > endDate) {
      return NextResponse.json(
        { error: "Date must be within the challenge date range" },
        { status: 400 }
      );
    }

    // Upsert: create or update existing entry for same user+challenge+date
    const progressLog = await prisma.progressLog.upsert({
      where: {
        userId_challengeId_date: {
          userId: validated.userId,
          challengeId: validated.challengeId,
          date: validated.date,
        },
      },
      update: {
        value: { increment: validated.value },
      },
      create: {
        userId: validated.userId,
        challengeId: validated.challengeId,
        date: validated.date,
        value: validated.value,
      },
      include: {
        user: true,
        challenge: true,
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json(progressLog, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create progress log:", error);
    return NextResponse.json(
      { error: "Failed to create progress log" },
      { status: 500 }
    );
  }
}

// DELETE /api/progress - Delete a progress log by id (passed as query param)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Progress log ID is required" },
        { status: 400 }
      );
    }

    await prisma.progressLog.delete({
      where: { id },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete progress log:", error);
    return NextResponse.json(
      { error: "Failed to delete progress log" },
      { status: 500 }
    );
  }
}

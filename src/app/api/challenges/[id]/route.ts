import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateChallengeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/challenges/[id] - Get a single challenge with participant count
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            progressLogs: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Get unique participants count
    const participants = await prisma.progressLog.groupBy({
      by: ["userId"],
      where: { challengeId: id },
    });

    // Determine status
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

    return NextResponse.json({
      ...challenge,
      status,
      participantCount: participants.length,
    });
  } catch (error) {
    console.error("Failed to fetch challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}

// PUT /api/challenges/[id] - Update a challenge
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateChallengeSchema.parse(body);

    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        startDate: validated.startDate,
        endDate: validated.endDate,
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json(challenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update challenge:", error);
    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}

// DELETE /api/challenges/[id] - Delete a challenge (cascades to progress logs)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.challenge.delete({
      where: { id },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete challenge:", error);
    return NextResponse.json(
      { error: "Failed to delete challenge" },
      { status: 500 }
    );
  }
}

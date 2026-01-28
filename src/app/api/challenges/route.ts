import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createChallengeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// GET /api/challenges - Get all challenges with optional filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter"); // "active", "past", or null for all

    const now = new Date();
    let where = {};

    if (filter === "active") {
      where = {
        startDate: { lte: now },
        endDate: { gte: now },
      };
    } else if (filter === "past") {
      where = {
        endDate: { lt: now },
      };
    } else if (filter === "upcoming") {
      where = {
        startDate: { gt: now },
      };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        _count: {
          select: {
            progressLogs: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // Add status to each challenge
    const challengesWithStatus = challenges.map((challenge) => {
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

      return { ...challenge, status };
    });

    return NextResponse.json(challengesWithStatus);
  } catch (error) {
    console.error("Failed to fetch challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Create a new challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createChallengeSchema.parse(body);

    const challenge = await prisma.challenge.create({
      data: {
        title: validated.title,
        description: validated.description,
        startDate: validated.startDate,
        endDate: validated.endDate,
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}

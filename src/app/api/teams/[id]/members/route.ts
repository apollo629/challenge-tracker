import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/teams/[id]/members - Add a member to a team
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: teamId } = await params;
    const body = await request.json();
    const validated = addMemberSchema.parse(body);

    // Check if team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if membership already exists
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: validated.userId,
          teamId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    const membership = await prisma.teamMember.create({
      data: {
        userId: validated.userId,
        teamId,
      },
      include: {
        user: true,
        team: true,
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Failed to add member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

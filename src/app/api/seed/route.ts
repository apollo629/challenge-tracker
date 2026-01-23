import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/seed - Seed the database with sample data
export async function POST() {
  try {
    // Clear existing data
    await prisma.progressLog.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();
    await prisma.challenge.deleteMany();

    // Create users
    const users = await Promise.all([
      prisma.user.create({ data: { name: "Alice Johnson" } }),
      prisma.user.create({ data: { name: "Bob Smith" } }),
      prisma.user.create({ data: { name: "Charlie Brown" } }),
      prisma.user.create({ data: { name: "Diana Prince" } }),
      prisma.user.create({ data: { name: "Eve Williams" } }),
      prisma.user.create({ data: { name: "Frank Miller" } }),
    ]);

    // Create teams
    const teams = await Promise.all([
      prisma.team.create({ data: { name: "Alpha Squad" } }),
      prisma.team.create({ data: { name: "Beta Force" } }),
      prisma.team.create({ data: { name: "Gamma Warriors" } }),
    ]);

    // Assign users to teams
    await Promise.all([
      prisma.teamMember.create({ data: { userId: users[0].id, teamId: teams[0].id } }),
      prisma.teamMember.create({ data: { userId: users[1].id, teamId: teams[0].id } }),
      prisma.teamMember.create({ data: { userId: users[2].id, teamId: teams[0].id } }),
      prisma.teamMember.create({ data: { userId: users[3].id, teamId: teams[1].id } }),
      prisma.teamMember.create({ data: { userId: users[4].id, teamId: teams[1].id } }),
      prisma.teamMember.create({ data: { userId: users[5].id, teamId: teams[2].id } }),
      prisma.teamMember.create({ data: { userId: users[0].id, teamId: teams[2].id } }),
    ]);

    // Create challenges
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeWeeksFromNow = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);

    const challenges = await Promise.all([
      prisma.challenge.create({
        data: {
          title: "10K Steps Daily",
          description:
            "Walk at least 10,000 steps every day for better health. This challenge is designed to encourage regular physical activity and help participants develop a healthy walking habit.",
          startDate: oneWeekAgo,
          endDate: twoWeeksFromNow,
        },
      }),
      prisma.challenge.create({
        data: {
          title: "Meditation Minutes",
          description:
            "Practice mindfulness through daily meditation. Log the number of minutes you spend in meditation each day. Even 5 minutes counts!",
          startDate: oneWeekAgo,
          endDate: oneWeekFromNow,
        },
      }),
      prisma.challenge.create({
        data: {
          title: "Read 30 Pages",
          description:
            "Read at least 30 pages of any book every day. Expand your knowledge and develop a consistent reading habit.",
          startDate: oneWeekFromNow,
          endDate: threeWeeksFromNow,
        },
      }),
    ]);

    // Create progress logs
    const progressData = [];

    // Steps challenge progress (last 7 days)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);

      for (const user of users.slice(0, 5)) {
        progressData.push({
          userId: user.id,
          challengeId: challenges[0].id,
          date,
          value: Math.floor(Math.random() * 8000) + 5000,
        });
      }
    }

    // Meditation challenge progress
    for (let i = 0; i < 5; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);

      for (const user of users.slice(0, 4)) {
        progressData.push({
          userId: user.id,
          challengeId: challenges[1].id,
          date,
          value: Math.floor(Math.random() * 25) + 5,
        });
      }
    }

    await prisma.progressLog.createMany({ data: progressData });

    return NextResponse.json({
      success: true,
      created: {
        users: users.length,
        teams: teams.length,
        challenges: challenges.length,
        progressLogs: progressData.length,
      },
    });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if database already has data
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  // Create users
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Alice Johnson" } }),
    prisma.user.create({ data: { name: "Bob Smith" } }),
    prisma.user.create({ data: { name: "Charlie Brown" } }),
    prisma.user.create({ data: { name: "Diana Prince" } }),
    prisma.user.create({ data: { name: "Eve Williams" } }),
    prisma.user.create({ data: { name: "Frank Miller" } }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create teams
  const teams = await Promise.all([
    prisma.team.create({ data: { name: "Alpha Squad" } }),
    prisma.team.create({ data: { name: "Beta Force" } }),
    prisma.team.create({ data: { name: "Gamma Warriors" } }),
  ]);

  console.log(`Created ${teams.length} teams`);

  // Assign users to teams
  await Promise.all([
    // Alpha Squad: Alice, Bob, Charlie
    prisma.teamMember.create({
      data: { userId: users[0].id, teamId: teams[0].id },
    }),
    prisma.teamMember.create({
      data: { userId: users[1].id, teamId: teams[0].id },
    }),
    prisma.teamMember.create({
      data: { userId: users[2].id, teamId: teams[0].id },
    }),
    // Beta Force: Diana, Eve
    prisma.teamMember.create({
      data: { userId: users[3].id, teamId: teams[1].id },
    }),
    prisma.teamMember.create({
      data: { userId: users[4].id, teamId: teams[1].id },
    }),
    // Gamma Warriors: Frank, Alice (Alice in multiple teams)
    prisma.teamMember.create({
      data: { userId: users[5].id, teamId: teams[2].id },
    }),
    prisma.teamMember.create({
      data: { userId: users[0].id, teamId: teams[2].id },
    }),
  ]);

  console.log("Assigned users to teams");

  // Create challenges
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: "10K Steps Daily",
        description:
          "Walk at least 10,000 steps every day for better health. This challenge is designed to encourage regular physical activity and help participants develop a healthy walking habit. Track your daily steps and see how you compare with others!",
        startDate: oneWeekAgo,
        endDate: twoWeeksFromNow,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Read 30 Pages",
        description:
          "Read at least 30 pages of any book every day. Expand your knowledge, improve your focus, and develop a consistent reading habit. Any book counts - fiction, non-fiction, self-help, or technical!",
        startDate: oneWeekFromNow,
        endDate: twoWeeksFromNow,
      },
    }),
    prisma.challenge.create({
      data: {
        title: "Meditation Minutes",
        description:
          "Practice mindfulness through daily meditation. Log the number of minutes you spend in meditation each day. Even 5 minutes counts! Build mental clarity and reduce stress together.",
        startDate: oneWeekAgo,
        endDate: oneWeekFromNow,
      },
    }),
  ]);

  console.log(`Created ${challenges.length} challenges`);

  // Create some progress logs for the active challenges
  const progressData = [];

  // Steps challenge progress (last 7 days)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);

    // Each user logs different step counts
    for (const user of users.slice(0, 5)) {
      progressData.push({
        userId: user.id,
        challengeId: challenges[0].id,
        date,
        value: Math.floor(Math.random() * 8000) + 5000, // 5000-13000 steps
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
        challengeId: challenges[2].id,
        date,
        value: Math.floor(Math.random() * 25) + 5, // 5-30 minutes
      });
    }
  }

  await prisma.progressLog.createMany({ data: progressData });

  console.log(`Created ${progressData.length} progress logs`);
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

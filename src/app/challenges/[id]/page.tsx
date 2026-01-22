import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChallengeDetail } from "./challenge-detail";

async function getChallenge(id: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) return null;

  // Get unique participants
  const participants = await prisma.progressLog.groupBy({
    by: ["userId"],
    where: { challengeId: id },
    _sum: {
      value: true,
    },
  });

  // Get user details for participants
  const userIds = participants.map((p) => p.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });

  const participantsWithUsers = participants.map((p) => ({
    userId: p.userId,
    totalValue: p._sum.value || 0,
    user: users.find((u) => u.id === p.userId)!,
  }));

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

  return {
    ...challenge,
    status,
    participants: participantsWithUsers,
  };
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params;
  const challenge = await getChallenge(id);

  if (!challenge) {
    notFound();
  }

  return <ChallengeDetail challenge={challenge} />;
}

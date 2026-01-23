import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LeaderboardView } from "./leaderboard-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeaderboardPage({ params }: PageProps) {
  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    notFound();
  }

  return <LeaderboardView challengeId={id} challengeTitle={challenge.title} />;
}

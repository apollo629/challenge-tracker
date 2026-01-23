import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamDetail } from "./team-detail";

async function getTeam(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}

async function getAvailableUsers(teamId: string) {
  // Get users who are not already members of this team
  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });

  const memberIds = teamMembers.map((m) => m.userId);

  return prisma.user.findMany({
    where: {
      id: {
        notIn: memberIds,
      },
    },
    orderBy: { name: "asc" },
  });
}

async function getChallenges() {
  return prisma.challenge.findMany({
    orderBy: { startDate: "desc" },
    select: { id: true, title: true },
  });
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamPage({ params }: PageProps) {
  const { id } = await params;
  const [team, availableUsers, challenges] = await Promise.all([
    getTeam(id),
    getAvailableUsers(id),
    getChallenges(),
  ]);

  if (!team) {
    notFound();
  }

  return (
    <TeamDetail
      team={team}
      availableUsers={availableUsers}
      challenges={challenges}
    />
  );
}

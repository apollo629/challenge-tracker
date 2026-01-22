import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogProgressForm } from "./log-progress-form";

async function getChallenge(id: string) {
  return prisma.challenge.findUnique({
    where: { id },
  });
}

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
  });
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LogProgressPage({ params }: PageProps) {
  const { id } = await params;
  const [challenge, users] = await Promise.all([getChallenge(id), getUsers()]);

  if (!challenge) {
    notFound();
  }

  return <LogProgressForm challenge={challenge} users={users} />;
}

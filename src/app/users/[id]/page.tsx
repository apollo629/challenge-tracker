import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserDetail } from "./user-detail";

async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      teamMemberships: {
        include: {
          team: true,
        },
      },
      progressLogs: {
        include: {
          challenge: true,
        },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  return <UserDetail user={user} />;
}

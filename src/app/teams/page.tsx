import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getTeams() {
  return prisma.team.findMany({
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              Organize participants into teams for challenges
            </CardDescription>
          </div>
          <Link href="/teams/new">
            <Button>Create Team</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No teams yet. Create your first team to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <Link
                        href={`/teams/${team.id}`}
                        className="font-medium hover:underline"
                      >
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>{team._count.members} members</TableCell>
                    <TableCell>
                      {new Date(team.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

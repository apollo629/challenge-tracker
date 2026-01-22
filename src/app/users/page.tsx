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
import { Badge } from "@/components/ui/badge";

async function getUsers() {
  return prisma.user.findMany({
    include: {
      teamMemberships: {
        include: {
          team: true,
        },
      },
      _count: {
        select: {
          progressLogs: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage participants in your challenges
            </CardDescription>
          </div>
          <Link href="/users/new">
            <Button>Add User</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No users yet. Create your first user to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Progress Logs</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        href={`/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.teamMemberships.length === 0 ? (
                          <span className="text-muted-foreground text-sm">
                            No teams
                          </span>
                        ) : (
                          user.teamMemberships.map((membership) => (
                            <Badge key={membership.id} variant="secondary">
                              {membership.team.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user._count.progressLogs}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
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

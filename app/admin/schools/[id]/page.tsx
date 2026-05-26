import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSchoolWithSessions } from "@/lib/services/schools";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionStatusBadge } from "@/components/admin/session-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PageProps = { params: Promise<{ id: string }> };

export default async function SchoolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let data;
  try {
    data = await getSchoolWithSessions(supabase, id);
  } catch {
    notFound();
  }

  const { school, sessions } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{school.school_id}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{school.name}</h1>
          <div className="mt-2 flex gap-2">
            <Badge variant="outline">{school.type}</Badge>
            {school.active ? (
              <Badge variant="outline" className="border-0 bg-emerald-100 text-emerald-800">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>
        </div>
        <LinkButton href={`/admin/sessions/new?school_id=${school.id}`}>
          <Plus className="size-4" />
          New Session
        </LinkButton>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div><p className="text-muted-foreground">Area</p><p>{school.area ?? "—"}</p></div>
          <div><p className="text-muted-foreground">Ward</p><p>{school.ward ?? "—"}</p></div>
          <div><p className="text-muted-foreground">Medium</p><p>{school.medium ?? "—"}</p></div>
          <div><p className="text-muted-foreground">Std Range</p><p>{school.std_range ?? "—"}</p></div>
          <div><p className="text-muted-foreground">Contact</p><p>{school.contact_person ?? "—"}</p></div>
          <div><p className="text-muted-foreground">Phone</p><p>{school.contact_number ?? "—"}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Session History</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Carried</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/admin/sessions/${s.id}`} className="hover:underline">
                        {s.date}
                      </Link>
                    </TableCell>
                    <TableCell>{[s.class_grade, s.division].filter(Boolean).join(" ") || "—"}</TableCell>
                    <TableCell>{s.books_carried}</TableCell>
                    <TableCell>{s.books_returned}</TableCell>
                    <TableCell><SessionStatusBadge status={s.status} /></TableCell>
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

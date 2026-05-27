"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, isToday, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import type { SessionStatus, SessionWithSchool } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SessionStatusBadge } from "@/components/admin/session-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SessionRow = SessionWithSchool & {
  books_out: number;
  books_returned: number;
  missing: number;
};

export function SessionsPageClient() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);

    const res = await fetch(`/api/sessions?${params}`);
    const data = await res.json();
    setSessions(data.sessions ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aToday = isToday(parseISO(a.date));
      const bToday = isToday(parseISO(b.date));
      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;
      return b.date.localeCompare(a.date);
    });
  }, [sessions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">Every school reading session from start to finish — see which books were issued, which have been returned, flag missing books, and close out the session when done.</p>
        </div>
        <LinkButton href="/admin/sessions/new">
          <Plus className="size-4" />
          New Session
        </LinkButton>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="min-h-11 rounded-lg border border-input bg-background px-3 text-base"
      >
        <option value="">All statuses</option>
        {(["Planned", "Active", "Completed", "Cancelled"] as SessionStatus[]).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Out</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Missing</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : sorted.map((session) => (
                  <TableRow key={session.id} className={isToday(parseISO(session.date)) ? "bg-primary/5" : ""}>
                    <TableCell className="font-mono text-sm">
                      <Link href={`/admin/sessions/${session.id}`} className="hover:underline">
                        {session.session_id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(session.date), "d MMM yyyy")}
                      {isToday(parseISO(session.date)) && (
                        <Badge className="ml-2" variant="outline">Today</Badge>
                      )}
                    </TableCell>
                    <TableCell>{session.school?.name ?? "—"}</TableCell>
                    <TableCell>
                      {[session.class_grade, session.division].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>{session.books_out}</TableCell>
                    <TableCell>{session.books_returned}</TableCell>
                    <TableCell>
                      {session.missing > 0 ? (
                        <Badge variant="outline" className="border-0 bg-red-100 text-red-800">{session.missing}</Badge>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell><SessionStatusBadge status={session.status} /></TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {sorted.map((session) => (
          <Link key={session.id} href={`/admin/sessions/${session.id}`} className="block rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{session.session_id}</p>
                <p className="font-medium">{session.school?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(session.date), "d MMM yyyy")} · {session.books_returned}/{session.books_out} returned
                </p>
              </div>
              <SessionStatusBadge status={session.status} />
            </div>
          </Link>
        ))}
      </div>

      {!loading && sessions.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No sessions yet</p>
          <LinkButton href="/admin/sessions/new" className="mt-4">New Session</LinkButton>
        </div>
      )}
    </div>
  );
}

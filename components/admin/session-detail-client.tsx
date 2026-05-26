"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, Printer } from "lucide-react";
import type { SessionDetail } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SessionStatusBadge } from "@/components/admin/session-status-badge";
import { StatusBadge } from "@/components/admin/status-badge";

type SessionDetailClientProps = {
  sessionId: string;
};

export function SessionDetailClient({ sessionId }: SessionDetailClientProps) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}`);
    const data = await res.json();
    if (data.success) setSession(data.session);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  async function activate() {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/activate`, { method: "POST" });
    const data = await res.json();
    setActionLoading(false);
    if (!data.success) {
      setError(data.error);
      return;
    }
    setSession(data.session);
  }

  async function returnBook(bookId: string, damaged = false) {
    setActionLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/return-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        damaged,
        condition_note: damaged ? "Damaged on return" : null,
      }),
    });
    const data = await res.json();
    setActionLoading(false);
    if (data.success) setSession(data.session);
    else setError(data.error);
  }

  async function closeSession() {
    setActionLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/close`, { method: "POST" });
    const data = await res.json();
    setActionLoading(false);
    setCloseOpen(false);
    if (data.success) setSession(data.session);
    else setError(data.error);
  }

  if (loading || !session) {
    return <p className="text-sm text-muted-foreground">Loading session...</p>;
  }

  const pending = session.session_books.filter((sb) => sb.returned === null);
  const returned = session.session_books.filter((sb) => sb.returned === true);
  const missing = session.session_books.filter((sb) => sb.returned === false);
  const total = session.session_books.length;
  const progress = total ? Math.round((returned.length / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{session.session_id}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{session.school.name}</h1>
          <p className="text-sm text-muted-foreground">
            {session.date} · {[session.class_grade, session.division].filter(Boolean).join(" ")} · {session.conducted_by}
          </p>
          <div className="mt-2"><SessionStatusBadge status={session.status} /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/api/sessions/${sessionId}/sheet`} target="_blank" variant="outline">
            <Printer className="size-4" />
            Print Sheet
          </LinkButton>
          {session.status === "Planned" && (
            <Button onClick={activate} disabled={actionLoading} className="min-h-11">
              Activate Session →
            </Button>
          )}
          {session.status === "Active" && (
            <Button variant="destructive" onClick={() => setCloseOpen(true)} disabled={actionLoading} className="min-h-11">
              Close Session
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {session.status === "Active" && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>{returned.length} / {total} returned</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      {session.status === "Active" && pending.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Awaiting Return ({pending.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pending.map((sb) => (
              <div key={sb.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{sb.book.bbid}</p>
                  <p className="font-medium">{sb.book.title}</p>
                  <p className="text-sm text-muted-foreground">{sb.book.author ?? "Unknown"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => returnBook(sb.book_id)} disabled={actionLoading} className="min-h-11">
                    <Check className="size-4" /> Returned
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => returnBook(sb.book_id, true)} disabled={actionLoading} className="min-h-11">
                    <AlertTriangle className="size-4" /> Damaged
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {returned.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-emerald-700">Returned ({returned.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {returned.map((sb) => (
              <div key={sb.id} className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                <p className="font-mono text-xs">{sb.book.bbid}</p>
                <p className="font-medium">{sb.book.title}</p>
                {sb.condition_note && <p className="text-sm text-amber-700">{sb.condition_note}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(session.status === "Completed" || missing.length > 0) && missing.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-red-700">Missing ({missing.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {missing.map((sb) => (
              <div key={sb.id} className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/20">
                <p className="font-mono text-xs">{sb.book.bbid}</p>
                <p className="font-medium">{sb.book.title}</p>
                <StatusBadge status="Missing" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {session.status === "Planned" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Books in Bag ({total})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {session.session_books.map((sb) => (
              <div key={sb.id} className="rounded-lg border p-3">
                <p className="font-mono text-xs text-muted-foreground">{sb.book.bbid}</p>
                <p className="font-medium">{sb.book.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {session.status === "Completed" && (
        <div className="flex gap-2">
          <LinkButton href={`/api/sessions/${sessionId}/sheet`} target="_blank" variant="outline">
            Download Session Report
          </LinkButton>
          <LinkButton href="/admin/books/locate" variant="outline">
            Where is my book?
          </LinkButton>
        </div>
      )}

      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close session?</DialogTitle>
            <DialogDescription>
              {pending.length} book(s) not yet returned will be marked as missing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={closeSession} disabled={actionLoading}>
              Close Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

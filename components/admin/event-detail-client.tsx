"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Download } from "lucide-react";
import type { Event, EventRsvp } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/components/admin/event-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EventDetailClientProps = { eventId: string };

export function EventDetailClient({ eventId }: EventDetailClientProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/rsvps`).then((r) => r.json()),
    ]).then(([detail, rsvpData]) => {
      if (detail.success) {
        setEvent(detail.event);
        setRsvpCount(detail.rsvp_count ?? 0);
      }
      setRsvps(rsvpData.rsvps ?? []);
      setLoading(false);
    });
  }, [eventId]);

  function exportCsv() {
    const header = "Name,Contact,Email,Notes,Registered At\n";
    const rows = rsvps
      .map(
        (r) =>
          `"${r.name}","${r.contact}","${r.email ?? ""}","${(r.notes ?? "").replace(/"/g, '""')}","${r.created_at}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${eventId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!event) {
    return <p className="text-muted-foreground">Event not found.</p>;
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <LinkButton href={`/admin/events/${eventId}`} variant="ghost" onClick={() => setEditing(false)}>
          Cancel edit
        </LinkButton>
        <EventForm event={event} mode="edit" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LinkButton href="/admin/events" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Events
      </LinkButton>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(event.date), "EEE, d MMM yyyy · h:mm a")}
            {event.venue ? ` · ${event.venue}` : ""}
          </p>
          <p className="mt-1 text-sm">
            {rsvpCount} RSVPs
            {event.max_capacity != null ? ` / ${event.max_capacity} capacity` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="min-h-11" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="outline" className="min-h-11" onClick={exportCsv}>
            <Download className="size-4" />
            Export RSVPs
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rsvps.length ? rsvps.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.contact}</TableCell>
                <TableCell>{r.email ?? "—"}</TableCell>
                <TableCell>{format(new Date(r.created_at), "d MMM yyyy HH:mm")}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">No RSVPs yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

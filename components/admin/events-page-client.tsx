"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import type { Event } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EventRow = Event & { rsvp_count?: number };

export function EventsPageClient() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/events");
    const data = await res.json();
    const rows = data.events ?? [];

    const withCounts = await Promise.all(
      rows.map(async (event: Event) => {
        const detail = await fetch(`/api/events/${event.id}`).then((r) => r.json());
        return { ...event, rsvp_count: detail.rsvp_count ?? 0 };
      })
    );

    setEvents(withCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage library events like reading camps and workshops — set the date, location, and details, then publish them to the public website for members to discover.</p>
        </div>
        <LinkButton href="/admin/events/new">
          <Plus className="size-4" />
          New Event
        </LinkButton>
      </div>

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>RSVPs</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link href={`/admin/events/${event.id}`} className="font-medium hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(event.date), "d MMM yyyy")}</TableCell>
                    <TableCell>{event.venue ?? "—"}</TableCell>
                    <TableCell>
                      {event.rsvp_count ?? 0}
                      {event.max_capacity != null ? ` / ${event.max_capacity}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

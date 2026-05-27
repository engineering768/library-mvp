"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import type { Event } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EventWithCount = Event & { rsvp_count: number };

export function EventsPageClient() {
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upcoming Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All upcoming library events in one place — visitors can see what's on and find out how to join a reading camp, workshop, or community activity.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : events.length ? (
        <div className="space-y-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No upcoming events right now.</p>
      )}
    </div>
  );
}

function EventCard({ event }: { event: EventWithCount }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [rsvpCount, setRsvpCount] = useState(event.rsvp_count);

  const full = event.max_capacity != null && rsvpCount >= event.max_capacity;

  async function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const res = await fetch(`/api/public/events/${event.id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact, email: email || undefined }),
    });
    const data = await res.json();

    if (data.success) {
      setMessage("You're registered!");
      setRsvpCount((c) => c + 1);
      setName("");
      setContact("");
      setEmail("");
    } else {
      setMessage(data.error ?? "Registration failed");
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(new Date(event.date), "EEE, d MMM yyyy · h:mm a")}
          {event.venue ? ` · ${event.venue}` : ""}
        </p>
        {event.max_capacity != null && (
          <p className="text-sm font-medium">
            {rsvpCount} / {event.max_capacity} spots filled
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
        )}

        {!full && event.registration_open ? (
          <form onSubmit={handleRsvp} className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="min-h-11 text-base"
            />
            <Input
              placeholder="WhatsApp / phone"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="min-h-11 text-base"
            />
            <Input
              placeholder="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 text-base sm:col-span-2"
            />
            <Button type="submit" disabled={submitting} className="min-h-11 sm:col-span-2 sm:w-fit">
              {submitting ? "Registering..." : "RSVP"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            {full ? "This event is full." : "Registration is closed."}
          </p>
        )}

        {message && <p className="text-sm text-primary">{message}</p>}
      </CardContent>
    </Card>
  );
}

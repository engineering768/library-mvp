"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event, EventStatus } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EventFormProps = {
  event?: Event;
  mode: "create" | "edit";
};

const STATUSES: EventStatus[] = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(event?.registration_open ?? true);

  function toLocalDatetimeValue(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? "") || null,
      date: new Date(String(form.get("date"))).toISOString(),
      venue: String(form.get("venue") ?? "") || null,
      max_capacity: form.get("max_capacity") ? Number(form.get("max_capacity")) : null,
      registration_open: registrationOpen,
      status: String(form.get("status") ?? "Upcoming") as EventStatus,
    };

    const url = mode === "create" ? "/api/events" : `/api/events/${event!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(mode === "create" ? `/admin/events/${data.event.id}` : `/admin/events/${event!.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" defaultValue={event?.title ?? ""} required className="min-h-11 text-base" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={event?.description ?? ""} rows={4} className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date & Time *</Label>
          <Input id="date" name="date" type="datetime-local" defaultValue={toLocalDatetimeValue(event?.date)} required className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input id="venue" name="venue" defaultValue={event?.venue ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_capacity">Max Capacity</Label>
          <Input id="max_capacity" name="max_capacity" type="number" min={1} defaultValue={event?.max_capacity ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={event?.status ?? "Upcoming"} className="min-h-11 w-full rounded-lg border px-3 text-base">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={registrationOpen} onChange={(e) => setRegistrationOpen(e.target.checked)} />
        Registration open
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="min-h-11">
        {loading ? "Saving..." : mode === "create" ? "Create Event" : "Save Changes"}
      </Button>
    </form>
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Event, EventRsvp, EventStatus } from "@/lib/supabase/types";
import type { EventFormValues } from "@/lib/validations/phase3";

export type RsvpFormValues = {
  name: string;
  contact: string;
  email?: string | null;
  notes?: string | null;
};

export async function listEvents(
  supabase: SupabaseClient,
  options: { upcomingOnly?: boolean; admin?: boolean } = {}
) {
  let query = supabase.from("events").select("*").order("date", { ascending: true });

  if (options.upcomingOnly) {
    query = query.in("status", ["Upcoming", "Ongoing"]).eq("registration_open", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Event[];
}

export async function getEventWithRsvpCount(supabase: SupabaseClient, id: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  const { count } = await supabase
    .from("event_rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id);

  return { event: event as Event, rsvp_count: count ?? 0 };
}

export async function createEvent(supabase: SupabaseClient, values: EventFormValues) {
  const { data, error } = await supabase
    .from("events")
    .insert({
      ...values,
      description: values.description ?? null,
      venue: values.venue ?? null,
      max_capacity: values.max_capacity ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(
  supabase: SupabaseClient,
  id: string,
  values: Partial<EventFormValues>
) {
  const { data, error } = await supabase
    .from("events")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function createRsvp(
  supabase: SupabaseClient,
  eventId: string,
  values: RsvpFormValues
) {
  const { event, rsvp_count } = await getEventWithRsvpCount(supabase, eventId);

  if (!event.registration_open || event.status === "Cancelled") {
    throw new Error("Registration is closed for this event");
  }

  if (event.max_capacity && rsvp_count >= event.max_capacity) {
    throw new Error("Event is full");
  }

  const { data, error } = await supabase
    .from("event_rsvps")
    .insert({
      event_id: eventId,
      name: values.name,
      contact: values.contact,
      email: values.email || null,
      notes: values.notes || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Already registered with this contact");
    throw error;
  }

  return data as EventRsvp;
}

export async function listRsvps(supabase: SupabaseClient, eventId: string) {
  const { data, error } = await supabase
    .from("event_rsvps")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as EventRsvp[];
}

export async function getUpcomingEventsCount(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .in("status", ["Upcoming", "Ongoing"]);

  if (error) throw error;
  return count ?? 0;
}

export async function getTotalUpcomingRsvps(supabase: SupabaseClient) {
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .in("status", ["Upcoming", "Ongoing"]);

  if (!events?.length) return 0;

  const { count, error } = await supabase
    .from("event_rsvps")
    .select("*", { count: "exact", head: true })
    .in(
      "event_id",
      events.map((e) => e.id)
    );

  if (error) throw error;
  return count ?? 0;
}

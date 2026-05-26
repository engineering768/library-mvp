import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getEventWithRsvpCount, listEvents } from "@/lib/services/events";

export async function GET() {
  try {
    const supabase = createPublicClient();
    const events = await listEvents(supabase, { upcomingOnly: true });

    const withCounts = await Promise.all(
      events.map(async (event) => {
        const { rsvp_count } = await getEventWithRsvpCount(supabase, event.id);
        return { ...event, rsvp_count };
      })
    );

    return NextResponse.json({ success: true, events: withCounts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch events";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

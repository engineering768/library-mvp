import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createEvent, listEvents } from "@/lib/services/events";
import { eventFormSchema } from "@/lib/validations/phase3";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const upcomingOnly = searchParams.get("upcoming") === "true";

  try {
    const events = await listEvents(supabase!, { upcomingOnly, admin: true });
    return NextResponse.json({ success: true, events });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch events";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = eventFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const event = await createEvent(supabase!, parsed.data);
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getEventWithRsvpCount, updateEvent } from "@/lib/services/events";
import { eventFormSchema } from "@/lib/validations/phase3";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const result = await getEventWithRsvpCount(supabase!, id);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Event not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = eventFormSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const event = await updateEvent(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, event });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

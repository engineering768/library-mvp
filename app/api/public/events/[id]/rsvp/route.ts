import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRsvp } from "@/lib/services/events";
import { rsvpSchema } from "@/lib/validations/phase3";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const rsvp = await createRsvp(supabase, id, {
      ...parsed.data,
      email: parsed.data.email || null,
    });

    return NextResponse.json({ success: true, rsvp }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to register";
    const status = message.includes("full") || message.includes("closed") || message.includes("Already") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

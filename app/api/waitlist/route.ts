import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { addToWaitlist } from "@/lib/services/lending";
import { waitlistSchema } from "@/lib/validations/lending";

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    if (!parsed.data.member_id && !parsed.data.contact) {
      return NextResponse.json(
        { success: false, error: "Contact is required for waitlist" },
        { status: 400 }
      );
    }

    const entry = await addToWaitlist(supabase!, parsed.data);
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add to waitlist";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

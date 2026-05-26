import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addPublicWaitlist } from "@/lib/services/public-books";
import { publicWaitlistSchema } from "@/lib/validations/phase3";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = publicWaitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const entry = await addPublicWaitlist(supabase, parsed.data);
    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to join waitlist";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

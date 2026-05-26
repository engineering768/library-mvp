import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createSession, listSessions } from "@/lib/services/sessions";
import { sessionFormSchema } from "@/lib/validations/session";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);

  try {
    const sessions = await listSessions(supabase!, {
      status: searchParams.get("status") ?? undefined,
      school_id: searchParams.get("school_id") ?? undefined,
      date_from: searchParams.get("date_from") ?? undefined,
      date_to: searchParams.get("date_to") ?? undefined,
    });

    return NextResponse.json({ success: true, sessions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch sessions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = sessionFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const session = await createSession(supabase!, parsed.data);
    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

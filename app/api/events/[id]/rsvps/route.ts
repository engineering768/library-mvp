import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { listRsvps } from "@/lib/services/events";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const rsvps = await listRsvps(supabase!, id);
    return NextResponse.json({ success: true, rsvps });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch RSVPs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

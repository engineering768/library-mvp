import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { removeFromWaitlist } from "@/lib/services/lending";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    await removeFromWaitlist(supabase!, id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to remove from waitlist";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

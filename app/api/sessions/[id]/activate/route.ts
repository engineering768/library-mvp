import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { activateSession } from "@/lib/services/sessions";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const session = await activateSession(supabase!, id);
    return NextResponse.json({ success: true, session });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to activate session";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

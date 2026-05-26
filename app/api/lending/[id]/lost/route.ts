import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { markLendingLost } from "@/lib/services/lending";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const transaction = await markLendingLost(supabase!, id);
    return NextResponse.json({ success: true, transaction });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to mark as lost";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

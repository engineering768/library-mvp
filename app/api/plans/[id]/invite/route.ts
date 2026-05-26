import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { generateInviteCode } from "@/lib/services/plans";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const usesMax = typeof body.uses_max === "number" ? body.uses_max : 1;
    const expiresInDays = typeof body.expires_in_days === "number" ? body.expires_in_days : 30;

    const invite = await generateInviteCode(supabase!, id, usesMax, expiresInDays);
    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate invite code";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

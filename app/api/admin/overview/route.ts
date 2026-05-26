import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAdminOverview } from "@/lib/services/admin-overview";

export async function GET() {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const overview = await getAdminOverview(supabase!);
    return NextResponse.json({ success: true, overview });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load overview";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

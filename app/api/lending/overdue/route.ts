import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getOverdueLending } from "@/lib/services/lending";

export async function GET() {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const overdue = await getOverdueLending(supabase!);
    return NextResponse.json({ success: true, overdue });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch overdue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

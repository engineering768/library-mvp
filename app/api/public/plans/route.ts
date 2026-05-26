import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listPlans } from "@/lib/services/plans";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const plans = await listPlans(supabase, true);
    return NextResponse.json({ success: true, plans });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch plans";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

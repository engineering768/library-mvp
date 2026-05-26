import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createPlan, getExpiringInviteCodes, listPlans } from "@/lib/services/plans";
import { planFormSchema } from "@/lib/validations/phase3";

export async function GET() {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const [plans, expiring_invites] = await Promise.all([
      listPlans(supabase!),
      getExpiringInviteCodes(supabase!, 7),
    ]);
    return NextResponse.json({ success: true, plans, expiring_invites });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch plans";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = planFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const plan = await createPlan(supabase!, parsed.data);
    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create plan";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

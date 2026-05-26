import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { updatePlan } from "@/lib/services/plans";
import { planFormSchema } from "@/lib/validations/phase3";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = planFormSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const plan = await updatePlan(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, plan });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update plan";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

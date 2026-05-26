import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createPaymentOrder } from "@/lib/services/payments";
import { paymentOrderSchema } from "@/lib/validations/phase3";

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = paymentOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const order = await createPaymentOrder(
      supabase!,
      parsed.data.plan_id,
      parsed.data.member_id
    );

    return NextResponse.json({ success: true, order });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create order";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

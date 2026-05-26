import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  handlePaymentCaptured,
  verifyWebhookSignature,
} from "@/lib/services/payments";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id: string;
            order_id: string;
            amount: number;
            notes?: Record<string, string>;
          };
        };
      };
    };

    if (payload.event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ success: false, error: "Missing payment data" }, { status: 400 });
      }

      const supabase = createAdminClient();
      await handlePaymentCaptured(
        supabase,
        {
          order_id: payment.order_id,
          payment_id: payment.id,
          amount: payment.amount,
          notes: payment.notes,
        },
        payload
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook processing failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

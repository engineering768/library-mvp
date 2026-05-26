import Razorpay from "razorpay";
import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  activateMembershipFromPlan,
  getPlan,
  logPayment,
} from "@/lib/services/plans";

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createPaymentOrder(
  supabase: SupabaseClient,
  planId: string,
  memberId?: string | null
) {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new Error("Razorpay is not configured");
  }

  const plan = await getPlan(supabase, planId);
  if (!plan.active) throw new Error("Plan is not active");

  const amountPaise = Math.round(Number(plan.price) * 100);

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `plan-${plan.id.slice(0, 8)}-${Date.now()}`,
    notes: {
      plan_id: plan.id,
      member_id: memberId ?? "",
    },
  });

  await logPayment(supabase, {
    razorpay_order_id: order.id,
    member_id: memberId ?? undefined,
    plan_id: plan.id,
    amount: Number(plan.price),
    status: "created",
  });

  return {
    order_id: order.id,
    amount: amountPaise,
    currency: order.currency,
    key_id: process.env.RAZORPAY_KEY_ID,
    plan,
  };
}

export function verifyWebhookSignature(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expected === signature;
}

export async function handlePaymentCaptured(
  supabase: SupabaseClient,
  payload: {
    order_id: string;
    payment_id: string;
    amount: number;
    notes?: Record<string, string>;
  },
  rawPayload: unknown
) {
  const planId = payload.notes?.plan_id;
  const memberId = payload.notes?.member_id;

  if (!planId || !memberId) {
    throw new Error("Missing plan_id or member_id in payment notes");
  }

  const plan = await getPlan(supabase, planId);
  await activateMembershipFromPlan(supabase, memberId, plan);

  await logPayment(supabase, {
    razorpay_order_id: payload.order_id,
    razorpay_payment_id: payload.payment_id,
    member_id: memberId,
    plan_id: planId,
    amount: payload.amount / 100,
    status: "paid",
    webhook_payload: rawPayload,
  });
}

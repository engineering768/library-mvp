import type { SupabaseClient } from "@supabase/supabase-js";
import type { InviteCode, SubscriptionPlan } from "@/lib/supabase/types";
import { addDaysToDate, todayISO } from "@/lib/utils/date";
import type { PlanFormValues } from "@/lib/validations/phase3";
import { getMember, updateMember } from "@/lib/services/members";

export async function listPlans(supabase: SupabaseClient, activeOnly = false) {
  let query = supabase.from("subscription_plans").select("*").order("price", { ascending: true });
  if (activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SubscriptionPlan[];
}

export async function getPlan(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as SubscriptionPlan;
}

export async function createPlan(supabase: SupabaseClient, values: PlanFormValues) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data as SubscriptionPlan;
}

export async function updatePlan(
  supabase: SupabaseClient,
  id: string,
  values: Partial<PlanFormValues>
) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SubscriptionPlan;
}

function randomCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateInviteCode(
  supabase: SupabaseClient,
  planId: string,
  usesMax = 1,
  expiresInDays = 30
) {
  const expires_at = addDaysToDate(todayISO(), expiresInDays);
  let code = randomCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data, error } = await supabase
      .from("invite_codes")
      .insert({
        code,
        plan_id: planId,
        uses_max: usesMax,
        expires_at,
      })
      .select()
      .single();

    if (!error) return data as InviteCode;
    code = randomCode();
    attempts++;
  }

  throw new Error("Failed to generate invite code");
}

export async function activateMembershipFromPlan(
  supabase: SupabaseClient,
  memberId: string,
  plan: SubscriptionPlan
) {
  const member = await getMember(supabase, memberId);
  const today = todayISO();
  const start =
    member.membership_end >= today ? member.membership_end : today;
  const end = addDaysToDate(start, plan.validity_days);

  return updateMember(supabase, memberId, {
    membership_type: plan.type,
    membership_start: today,
    membership_end: end,
    max_books_quota: plan.max_books_quota,
    status: "Active",
  });
}

export async function logPayment(
  supabase: SupabaseClient,
  payload: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    member_id?: string;
    plan_id?: string;
    amount?: number;
    status: string;
    webhook_payload?: unknown;
  }
) {
  const { data, error } = await supabase
    .from("payment_log")
    .insert({
      ...payload,
      webhook_payload: payload.webhook_payload ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRevenueMtd(supabase: SupabaseClient) {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("payment_log")
    .select("amount")
    .eq("status", "paid")
    .gte("created_at", start);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
}

export async function getRecentPayments(supabase: SupabaseClient, limit = 5) {
  const { data, error } = await supabase
    .from("payment_log")
    .select("*, plan:subscription_plans(name), member:members(name, member_id)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getExpiringInviteCodes(supabase: SupabaseClient, days = 7) {
  const today = todayISO();
  const end = addDaysToDate(today, days);

  const { data, error } = await supabase
    .from("invite_codes")
    .select("*, plan:subscription_plans(name)")
    .gte("expires_at", today)
    .lte("expires_at", end)
    .order("expires_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

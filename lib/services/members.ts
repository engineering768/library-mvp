import type { SupabaseClient } from "@supabase/supabase-js";
import type { Member, MemberProfile } from "@/lib/supabase/types";
import { generateMemberId } from "@/lib/utils/member-id";
import { todayISO } from "@/lib/utils/date";
import type { MemberFormValues } from "@/lib/validations/member";

export type MemberListParams = {
  status?: string;
  membership_type?: string;
  search?: string;
};

function emptyToNull(value: string | null | undefined) {
  if (value === "" || value === undefined) return null;
  return value;
}

export function normalizeMemberPayload(data: MemberFormValues) {
  return {
    ...data,
    age: data.age ?? null,
    school_name: emptyToNull(data.school_name ?? null),
    standard: emptyToNull(data.standard ?? null),
    medium: emptyToNull(data.medium ?? null),
    gender: emptyToNull(data.gender ?? null),
    parent_name: emptyToNull(data.parent_name ?? null),
    address: emptyToNull(data.address ?? null),
    notes: emptyToNull(data.notes ?? null),
  };
}

export async function listMembers(
  supabase: SupabaseClient,
  params: MemberListParams = {}
) {
  let query = supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.membership_type)
    query = query.eq("membership_type", params.membership_type);
  if (params.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `name.ilike.${term},member_id.ilike.${term},parent_contact.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Member[];
}

export async function getMember(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Member;
}

export async function getMemberProfile(
  supabase: SupabaseClient,
  id: string
): Promise<MemberProfile> {
  const member = await getMember(supabase, id);

  const { data: loans, error } = await supabase
    .from("lending_transactions")
    .select(
      `
      *,
      member:members ( id, member_id, name, parent_contact, status ),
      book:books ( id, bbid, title, author, status, stock )
    `
    )
    .eq("member_id", id)
    .order("borrow_date", { ascending: false });

  if (error) throw error;

  const allLoans = (loans ?? []) as MemberProfile["loan_history"];
  const active_loans = allLoans.filter(
    (l) => l.status === "Active" || l.status === "Overdue"
  );
  const loan_history = allLoans.filter((l) => l.status === "Returned" || l.status === "Lost");

  const { count: damage_incidents } = await supabase
    .from("damage_log")
    .select("*", { count: "exact", head: true })
    .eq("member_id", id)
    .in("event_type", ["Damaged", "Lost"]);

  return {
    ...member,
    active_loans,
    loan_history,
    damage_incidents: damage_incidents ?? 0,
    books_out: active_loans.length,
    total_borrows: allLoans.length,
  };
}

export async function createMember(
  supabase: SupabaseClient,
  payload: MemberFormValues
) {
  const member_id = await generateMemberId(supabase);
  const normalized = normalizeMemberPayload(payload);

  const { data, error } = await supabase
    .from("members")
    .insert({ ...normalized, member_id })
    .select()
    .single();

  if (error) throw error;
  return data as Member;
}

export async function updateMember(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<MemberFormValues>
) {
  const normalized = normalizeMemberPayload(payload as MemberFormValues);

  const { data, error } = await supabase
    .from("members")
    .update(normalized)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Member;
}

export async function suspendMember(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("members")
    .update({ status: "Suspended" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Member;
}

export async function getMemberDamageCount(
  supabase: SupabaseClient,
  memberId: string
) {
  const { count, error } = await supabase
    .from("damage_log")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId)
    .in("event_type", ["Damaged", "Lost"]);

  if (error) throw error;
  return count ?? 0;
}

export async function getActiveMembersCount(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "Active");

  if (error) throw error;
  return count ?? 0;
}

export async function getExpiredThisMonthCount(supabase: SupabaseClient) {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const end = todayISO();

  const { count, error } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .gte("membership_end", start)
    .lte("membership_end", end)
    .eq("status", "Expired");

  if (error) throw error;
  return count ?? 0;
}

export async function getExpiringMembers(supabase: SupabaseClient, days = 7) {
  const today = todayISO();
  const future = new Date();
  future.setDate(future.getDate() + days);
  const end = future.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("members")
    .select("id, member_id, name, membership_end, parent_contact")
    .eq("status", "Active")
    .gte("membership_end", today)
    .lte("membership_end", end)
    .order("membership_end", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function buildMemberCardHtml(member: Member) {
  const validity = `${member.membership_start} – ${member.membership_end}`;

  const card = `
    <div class="card">
      <div class="brand">📚 BOOKBERRY LIBRARY</div>
      <hr />
      <div class="name">${escapeHtml(member.name)}</div>
      <div class="row"><span>Member ID:</span> ${member.member_id}</div>
      <div class="row"><span>Valid:</span> ${validity}</div>
      <div class="row"><span>Max Books:</span> ${member.max_books_quota}</div>
      <div class="row"><span>Contact:</span> ${escapeHtml(member.parent_contact)}</div>
      <hr />
      <div class="qr">${member.member_id}</div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Member Card — ${member.member_id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; padding: 8mm; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
    .card {
      border: 1px solid #333;
      padding: 5mm;
      height: 85mm;
      page-break-inside: avoid;
    }
    .brand { font-weight: bold; font-size: 10pt; margin-bottom: 2mm; }
    hr { border: none; border-top: 1px solid #ccc; margin: 2mm 0; }
    .name { font-size: 13pt; font-weight: bold; margin: 2mm 0; }
    .row { font-size: 9pt; margin: 1mm 0; }
    .row span { color: #555; }
    .qr {
      font-family: monospace;
      font-size: 8pt;
      text-align: center;
      padding: 2mm;
      border: 1px dashed #999;
      margin-top: 2mm;
    }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print" style="margin-bottom: 6mm;">Print — 4 cards per A4 sheet.</p>
  <div class="grid">${Array.from({ length: 4 }).map(() => card).join("")}</div>
  <script class="no-print">window.onload = () => window.print();</script>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

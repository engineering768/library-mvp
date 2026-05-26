import type { SupabaseClient } from "@supabase/supabase-js";

export type MonthBucket = {
  key: string;
  label: string;
  revenue: number;
  lendings: number;
  members: number;
};

export type DashboardChartData = {
  books: {
    available: number;
    outSession: number;
    outMember: number;
    damaged: number;
    missing: number;
  };
  operations: {
    sessionsToday: number;
    booksOutSessions: number;
    activeMembers: number;
    booksOutMembers: number;
    overdue: number;
    eventRsvps: number;
    upcomingEvents: number;
  };
  monthly: MonthBucket[];
};

function lastNMonths(n: number) {
  const buckets: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-IN", { month: "short" }),
    });
  }
  return buckets;
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export async function getDashboardChartData(
  supabase: SupabaseClient
): Promise<DashboardChartData> {
  const months = lastNMonths(6);
  const start = `${months[0].key}-01`;

  const [booksRes, paymentsRes, lendingRes, membersRes] = await Promise.all([
    supabase.from("books").select("status"),
    supabase
      .from("payment_log")
      .select("amount, created_at")
      .eq("status", "paid")
      .gte("created_at", start),
    supabase.from("lending_transactions").select("borrow_date").gte("borrow_date", start),
    supabase.from("members").select("created_at").gte("created_at", start),
  ]);

  const books = booksRes.data ?? [];
  const bookData = {
    available: books.filter((b) => b.status === "Available").length,
    outSession: books.filter((b) => b.status === "Out - Session").length,
    outMember: books.filter((b) => b.status === "Out - Member").length,
    damaged: books.filter((b) => b.status === "Damaged").length,
    missing: books.filter((b) => b.status === "Missing").length,
  };

  const monthly = months.map((m) => ({
    ...m,
    revenue: 0,
    lendings: 0,
    members: 0,
  }));

  const monthMap = new Map(monthly.map((m) => [m.key, m]));

  for (const p of paymentsRes.data ?? []) {
    const bucket = monthMap.get(monthKey(p.created_at));
    if (bucket) bucket.revenue += Number(p.amount ?? 0);
  }

  for (const l of lendingRes.data ?? []) {
    const bucket = monthMap.get(monthKey(l.borrow_date));
    if (bucket) bucket.lendings += 1;
  }

  for (const m of membersRes.data ?? []) {
    const bucket = monthMap.get(monthKey(m.created_at));
    if (bucket) bucket.members += 1;
  }

  return {
    books: bookData,
    operations: {
      sessionsToday: 0,
      booksOutSessions: bookData.outSession,
      activeMembers: 0,
      booksOutMembers: bookData.outMember,
      overdue: 0,
      eventRsvps: 0,
      upcomingEvents: 0,
    },
    monthly,
  };
}

export function mergeChartOperations(
  charts: DashboardChartData,
  stats: {
    todays_sessions: number;
    active_members: number;
    overdue_count: number;
    upcoming_event_rsvps: number;
    upcoming_events: number;
  }
): DashboardChartData {
  return {
    ...charts,
    operations: {
      ...charts.operations,
      sessionsToday: stats.todays_sessions,
      activeMembers: stats.active_members,
      overdue: stats.overdue_count,
      eventRsvps: stats.upcoming_event_rsvps,
      upcomingEvents: stats.upcoming_events,
    },
  };
}

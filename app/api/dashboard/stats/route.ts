import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getDashboardStats, getRecentBooks } from "@/lib/services/books";
import { getTodaysSessionsCount } from "@/lib/services/sessions";
import {
  getActiveMembersCount,
  getExpiredThisMonthCount,
  getExpiringMembers,
} from "@/lib/services/members";
import {
  getBooksOutMembersCount,
  getOverdueCount,
} from "@/lib/services/lending";
import {
  getRecentPayments,
  getRevenueMtd,
} from "@/lib/services/plans";
import {
  getTotalUpcomingRsvps,
  getUpcomingEventsCount,
} from "@/lib/services/events";
import {
  getDashboardChartData,
  mergeChartOperations,
} from "@/lib/services/dashboard-charts";

export async function GET() {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const [
      stats,
      recent,
      todays_sessions,
      active_members,
      expired_members_month,
      overdue_count,
      books_out_members,
      expiring_members,
      revenue_mtd,
      upcoming_events,
      upcoming_event_rsvps,
      recent_payments,
      chartBase,
    ] = await Promise.all([
      getDashboardStats(supabase!),
      getRecentBooks(supabase!, 10),
      getTodaysSessionsCount(supabase!),
      getActiveMembersCount(supabase!),
      getExpiredThisMonthCount(supabase!),
      getOverdueCount(supabase!),
      getBooksOutMembersCount(supabase!),
      getExpiringMembers(supabase!, 7),
      getRevenueMtd(supabase!),
      getUpcomingEventsCount(supabase!),
      getTotalUpcomingRsvps(supabase!),
      getRecentPayments(supabase!, 5),
      getDashboardChartData(supabase!),
    ]);

    const enrichedStats = {
      ...stats,
      todays_sessions,
      active_members,
      expired_members_month,
      overdue_count,
      books_out_members,
      revenue_mtd,
      upcoming_events,
      upcoming_event_rsvps,
    };

    const charts = mergeChartOperations(chartBase, {
      todays_sessions,
      active_members,
      overdue_count,
      upcoming_event_rsvps,
      upcoming_events,
    });

    return NextResponse.json({
      success: true,
      stats: enrichedStats,
      charts,
      recent,
      expiring_members,
      recent_payments,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load stats";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminOverview } from "@/lib/supabase/types";
import { getActiveMembersCount } from "@/lib/services/members";
import { getBooksOutMembersCount, getOverdueCount } from "@/lib/services/lending";
import {
  getRecentPayments,
  getRevenueMtd,
} from "@/lib/services/plans";
import {
  getTotalUpcomingRsvps,
  getUpcomingEventsCount,
} from "@/lib/services/events";

export async function getAdminOverview(supabase: SupabaseClient): Promise<AdminOverview> {
  const [
    active_subscribers,
    all_active_rentals,
    overdue_count,
    revenue_mtd,
    upcoming_event_rsvps,
    upcoming_events,
    recent_payments,
  ] = await Promise.all([
    getActiveMembersCount(supabase),
    getBooksOutMembersCount(supabase),
    getOverdueCount(supabase),
    getRevenueMtd(supabase),
    getTotalUpcomingRsvps(supabase),
    getUpcomingEventsCount(supabase),
    getRecentPayments(supabase, 5),
  ]);

  return {
    active_subscribers,
    all_active_rentals,
    overdue_count,
    revenue_mtd,
    upcoming_event_rsvps,
    upcoming_events,
    recent_payments,
  };
}

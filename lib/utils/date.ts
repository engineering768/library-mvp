import { addDays, format, parseISO } from "date-fns";
import type { MembershipType } from "@/lib/supabase/types";

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function addDaysToDate(dateStr: string, days: number) {
  return format(addDays(parseISO(dateStr), days), "yyyy-MM-dd");
}

export function calcDueDate(borrowDate: string, rentalValidityDays: number) {
  return addDaysToDate(borrowDate, rentalValidityDays);
}

export function calcGraceUntil(dueDate: string) {
  return addDaysToDate(dueDate, 7);
}

const MEMBERSHIP_DAYS: Record<MembershipType, number> = {
  Monthly: 30,
  Quarterly: 90,
  Annual: 365,
  Free: 30,
};

export function calcMembershipEnd(
  startDate: string,
  type: MembershipType
): string {
  return addDaysToDate(startDate, MEMBERSHIP_DAYS[type]);
}

export function daysUntil(dateStr: string) {
  const target = parseISO(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDateRange(start: string, end: string) {
  return `${format(parseISO(start), "MMM yyyy")} – ${format(parseISO(end), "MMM yyyy")}`;
}

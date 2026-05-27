"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  MapPin,
  Plus,
  RefreshCw,
  Upload,
  Users,
} from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import type { DashboardStats, ExpiringMember } from "@/lib/supabase/types";
import type { DashboardChartData } from "@/lib/services/dashboard-charts";
import {
  AttentionPanel,
  DonutChart,
  KpiStrip,
  MonthlyTrendChart,
  OperationsBarChart,
  bookSegmentsFromCharts,
} from "@/components/admin/dashboard-charts";

type RecentPayment = {
  id: string;
  amount: number;
  plan?: { name: string } | null;
  member?: { name: string } | null;
};

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardChartData | null>(null);
  const [expiring, setExpiring] = useState<ExpiringMember[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setCharts(data.charts);
          setExpiring(data.expiring_members ?? []);
          setRecentPayments(data.recent_payments ?? []);
        }
        setLoading(false);
      });
  }, []);

  const issues = (stats?.missing ?? 0) + (stats?.overdue_count ?? 0) + expiring.length;

  const attentionItems = [
    ...(stats?.missing
      ? [{ label: "Missing books", detail: `${stats.missing} not accounted for`, href: "/admin/books?status=Missing" }]
      : []),
    ...(stats?.overdue_count
      ? [{ label: "Overdue loans", detail: `${stats.overdue_count} need follow-up`, href: "/admin/lending" }]
      : []),
    ...expiring.map((m) => ({
      label: m.name,
      detail: `Membership ends ${m.membership_end}`,
      href: `/admin/members/${m.id}`,
    })),
  ];

  const ops = charts?.operations;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your daily command centre — see how many members are active, which sessions are running today, which books are overdue, and what needs your attention right now.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin/lending/new" size="sm">
            <RefreshCw className="size-4" />
            New lending
          </LinkButton>
          <LinkButton href="/admin/sessions/new" variant="outline" size="sm">
            <CalendarDays className="size-4" />
            New session
          </LinkButton>
          <LinkButton href="/" target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
            <BookOpen className="size-4" />
            User view
          </LinkButton>
        </div>
      </div>

      <KpiStrip
        loading={loading}
        items={[
          {
            label: "Total books",
            value: stats?.total ?? 0,
            href: "/admin/books",
          },
          {
            label: "Active members",
            value: stats?.active_members ?? 0,
            href: "/admin/members?status=Active",
          },
          {
            label: "Revenue (MTD)",
            value: `₹${stats?.revenue_mtd ?? 0}`,
            href: "/admin/plans",
          },
          {
            label: "Needs attention",
            value: issues,
            href: "/admin/lending",
            alert: issues > 0,
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DonutChart
          title="Where are the books?"
          description="Share of catalog by location & condition"
          segments={charts ? bookSegmentsFromCharts(charts.books) : []}
          loading={loading}
          centerLabel="total"
        />
        <OperationsBarChart
          title="Operations snapshot"
          description="Compare sessions, members, lending & events"
          loading={loading}
          items={[
            { label: "Sessions today", value: ops?.sessionsToday ?? 0, color: "#3b82f6", href: "/admin/sessions" },
            { label: "Active members", value: ops?.activeMembers ?? 0, color: "#171717", href: "/admin/members" },
            { label: "Overdue", value: ops?.overdue ?? 0, color: "#ef4444", href: "/admin/lending" },
            { label: "Event RSVPs", value: ops?.eventRsvps ?? 0, color: "#f59e0b", href: "/admin/events" },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyTrendChart
          title="Revenue trend"
          description="Paid memberships — last 6 months"
          data={charts?.monthly ?? []}
          loading={loading}
          series={[{ key: "revenue", label: "Revenue (₹)", color: "#10b981", prefix: "₹" }]}
        />
        <MonthlyTrendChart
          title="Activity comparison"
          description="New lendings vs new members — last 6 months"
          data={charts?.monthly ?? []}
          loading={loading}
          series={[
            { key: "lendings", label: "Lendings", color: "#8b5cf6" },
            { key: "members", label: "New members", color: "#3b82f6" },
          ]}
        />
      </div>

      <AttentionPanel items={attentionItems} loading={loading} />

      {recentPayments.length > 0 && (
        <div className="rounded-xl border px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Latest payments
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {recentPayments.slice(0, 4).map((p) => (
              <span key={p.id} className="tabular-nums">
                <span className="text-muted-foreground">{p.member?.name ?? "Member"}</span>
                {" · "}
                <span className="font-medium">₹{Number(p.amount).toFixed(0)}</span>
              </span>
            ))}
            <Link href="/admin/plans" className="text-primary hover:underline">
              View all
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t pt-4 text-sm text-muted-foreground">
        <Link href="/admin/books/new" className="inline-flex items-center gap-1 hover:text-foreground">
          <Plus className="size-3.5" /> Add book
        </Link>
        <span>·</span>
        <Link href="/admin/members/new" className="inline-flex items-center gap-1 hover:text-foreground">
          <Users className="size-3.5" /> Add member
        </Link>
        <span>·</span>
        <Link href="/admin/books/locate" className="inline-flex items-center gap-1 hover:text-foreground">
          <MapPin className="size-3.5" /> Locate book
        </Link>
        <span>·</span>
        <Link href="/admin/books/import" className="inline-flex items-center gap-1 hover:text-foreground">
          <Upload className="size-3.5" /> Import CSV
        </Link>
      </div>
    </div>
  );
}

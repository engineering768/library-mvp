"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardChartData, MonthBucket } from "@/lib/services/dashboard-charts";

const BOOK_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

type DonutSegment = { label: string; value: number; color: string; href?: string };

export function DonutChart({
  title,
  description,
  segments,
  loading,
  centerLabel,
}: {
  title: string;
  description?: string;
  segments: DonutSegment[];
  loading?: boolean;
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const size = 160;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mx-auto size-40 rounded-full" />
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={stroke}
                  className="text-muted/40"
                />
                {total > 0 &&
                  segments.map((seg) => {
                    const pct = seg.value / total;
                    const dash = pct * circumference;
                    const el = (
                      <circle
                        key={seg.label}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={stroke}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                      />
                    );
                    offset += dash;
                    return el;
                  })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tabular-nums">{total}</span>
                <span className="text-xs text-muted-foreground">{centerLabel ?? "books"}</span>
              </div>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {segments.map((seg) => {
                const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
                const row = (
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: seg.color }} />
                      {seg.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {seg.value} <span className="text-xs">({pct}%)</span>
                    </span>
                  </li>
                );
                return seg.href ? (
                  <Link key={seg.label} href={seg.href} className="block hover:opacity-80">
                    {row}
                  </Link>
                ) : (
                  <div key={seg.label}>{row}</div>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OperationsBarChart({
  title,
  description,
  items,
  loading,
}: {
  title: string;
  description?: string;
  items: { label: string; value: number; color: string; href?: string }[];
  loading?: boolean;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="flex h-48 items-end justify-around gap-2 border-b border-muted pb-1">
            {items.map((item) => {
              const h = item.value > 0 ? Math.max((item.value / max) * 100, 8) : 4;
              const bar = (
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium tabular-nums">{item.value}</span>
                  <div
                    className="w-full max-w-12 rounded-t-md transition-all"
                    style={{ height: `${h}%`, backgroundColor: item.color, minHeight: 4 }}
                  />
                  <span className="max-w-[4.5rem] text-center text-[10px] leading-tight text-muted-foreground sm:text-xs">
                    {item.label}
                  </span>
                </div>
              );
              return item.href ? (
                <Link key={item.label} href={item.href} className="flex flex-1 hover:opacity-80">
                  {bar}
                </Link>
              ) : (
                <div key={item.label} className="flex flex-1">
                  {bar}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyTrendChart({
  title,
  description,
  data,
  loading,
  series,
}: {
  title: string;
  description?: string;
  data: MonthBucket[];
  loading?: boolean;
  series: { key: keyof Pick<MonthBucket, "revenue" | "lendings" | "members">; label: string; color: string; prefix?: string }[];
}) {
  const max = Math.max(...data.flatMap((d) => series.map((s) => Number(d[s.key]))), 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-44 w-full" />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-3 text-xs">
              {series.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
            <div className="flex h-44 items-end gap-1 sm:gap-2">
              {data.map((month) => (
                <div key={month.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-36 w-full items-end justify-center gap-0.5 sm:gap-1">
                    {series.map((s) => {
                      const val = Number(month[s.key]);
                      const h = val > 0 ? Math.max((val / max) * 100, 6) : 0;
                      return (
                        <div
                          key={s.key}
                          title={`${s.label}: ${s.prefix ?? ""}${val}`}
                          className="flex-1 max-w-3 rounded-t-sm sm:max-w-4"
                          style={{
                            height: `${h}%`,
                            backgroundColor: s.color,
                            minHeight: val > 0 ? 4 : 0,
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-muted-foreground sm:text-xs">{month.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiStrip({
  items,
  loading,
}: {
  items: { label: string; value: string | number; href: string; alert?: boolean }[];
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-border rounded-xl border bg-card sm:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "px-4 py-4 transition-colors hover:bg-muted/40",
            item.alert && "bg-red-50/60 dark:bg-red-950/20"
          )}
        >
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={cn("mt-1 text-xl font-semibold tabular-nums", item.alert && "text-red-700")}>
                {item.value}
              </p>
            </>
          )}
        </Link>
      ))}
    </div>
  );
}

export function AttentionPanel({
  items,
  loading,
}: {
  items: { label: string; detail: string; href: string }[];
  loading?: boolean;
}) {
  if (!loading && items.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Needs attention</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-amber-200/60 dark:divide-amber-900/60">
        {loading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.detail}</span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function bookSegmentsFromCharts(books: DashboardChartData["books"]): DonutSegment[] {
  return [
    { label: "Available", value: books.available, color: BOOK_COLORS[0], href: "/admin/books?status=Available" },
    { label: "Out — Sessions", value: books.outSession, color: BOOK_COLORS[1], href: "/admin/books?status=Out+-+Session" },
    { label: "Out — Members", value: books.outMember, color: BOOK_COLORS[2], href: "/admin/books?status=Out+-+Member" },
    { label: "Damaged", value: books.damaged, color: BOOK_COLORS[3], href: "/admin/books?status=Damaged" },
    { label: "Missing", value: books.missing, color: BOOK_COLORS[4], href: "/admin/books?status=Missing" },
  ].filter((s) => s.value > 0);
}

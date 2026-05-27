"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { LendingWithDetails } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LendingStatusBadge } from "@/components/admin/lending-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function LendingPageClient() {
  const [lending, setLending] = useState<LendingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const fetchLending = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/lending");
    const data = await res.json();
    setLending(data.lending ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLending();
  }, [fetchLending]);

  const overdueCount = useMemo(
    () => lending.filter((l) => l.status === "Overdue").length,
    [lending]
  );

  useEffect(() => {
    if (overdueCount > 0 && tab === "all") setTab("Overdue");
  }, [overdueCount, tab]);

  const filtered = useMemo(() => {
    if (tab === "all") return lending;
    return lending.filter((l) => l.status === tab);
  }, [lending, tab]);

  const tabs: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    { value: "Overdue", label: `Overdue${overdueCount ? ` (${overdueCount})` : ""}` },
    { value: "Active", label: "Active" },
    { value: "Returned", label: "Returned" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lending</h1>
          <p className="text-sm text-muted-foreground mt-1">Issue books to members, record returns, and keep track of who has what. Overdue items and lending limits are automatically flagged so nothing slips through.</p>
        </div>
        <LinkButton href="/admin/lending/new">
          <Plus className="size-4" />
          New Lending
        </LinkButton>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-sm">{row.transaction_id}</TableCell>
                        <TableCell>
                          <Link href={`/admin/members/${row.member_id}`} className="hover:underline">
                            {row.member.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{row.book.bbid}</span>
                          <br />
                          {row.book.title}
                        </TableCell>
                        <TableCell>{row.borrow_date}</TableCell>
                        <TableCell className={row.status === "Overdue" ? "text-red-600 font-medium" : ""}>
                          {row.due_date}
                        </TableCell>
                        <TableCell><LendingStatusBadge status={row.status} /></TableCell>
                        <TableCell>
                          {(row.status === "Active" || row.status === "Overdue") && (
                            <Link href={`/admin/lending/${row.id}/return`} className="text-primary underline text-sm">
                              Mark Returned
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

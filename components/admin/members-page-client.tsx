"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Search } from "lucide-react";
import type { Member } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberStatusBadge } from "@/components/admin/member-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MembersPageClient() {
  const [members, setMembers] = useState<(Member & { books_out?: number; damage?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [membershipType, setMembershipType] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (membershipType) params.set("membership_type", membershipType);

    const res = await fetch(`/api/members?${params}`);
    const data = await res.json();
    setMembers(data.members ?? []);
    setLoading(false);
  }, [search, status, membershipType]);

  useEffect(() => {
    const timer = setTimeout(fetchMembers, 250);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">Paid and free library members</p>
        </div>
        <LinkButton href="/admin/members/new">
          <Plus className="size-4" />
          Add Member
        </LinkButton>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, ID, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 pl-9 text-base"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-lg border px-3 text-base">
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
        <select value={membershipType} onChange={(e) => setMembershipType(e.target.value)} className="min-h-11 rounded-lg border px-3 text-base">
          <option value="">All types</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Annual">Annual</option>
          <option value="Free">Free</option>
        </select>
      </div>

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-sm">
                      <Link href={`/admin/members/${m.id}`} className="hover:underline">{m.member_id}</Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        {m.name}
                      </span>
                    </TableCell>
                    <TableCell>{m.school_name ?? "—"}</TableCell>
                    <TableCell>{m.membership_type}</TableCell>
                    <TableCell>
                      <MemberStatusBadge status={m.status} membershipEnd={m.membership_end} />
                    </TableCell>
                    <TableCell>{m.membership_end}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {members.map((m) => (
          <Link key={m.id} href={`/admin/members/${m.id}`} className="block rounded-lg border p-4">
            <p className="font-mono text-xs text-muted-foreground">{m.member_id}</p>
            <p className="font-medium">{m.name}</p>
            <MemberStatusBadge status={m.status} membershipEnd={m.membership_end} />
          </Link>
        ))}
      </div>

      {!loading && members.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No members yet</p>
          <LinkButton href="/admin/members/new" className="mt-4">Add Member</LinkButton>
        </div>
      )}
    </div>
  );
}

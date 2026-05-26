"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CreditCard, Pencil, Plus } from "lucide-react";
import type { MemberProfile } from "@/lib/supabase/types";
import { daysUntil } from "@/lib/utils/date";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberStatusBadge } from "@/components/admin/member-status-badge";
import { LendingStatusBadge } from "@/components/admin/lending-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MemberDetailClientProps = { memberId: string };

export function MemberDetailClient({ memberId }: MemberDetailClientProps) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/members/${memberId}`);
    const data = await res.json();
    if (data.success) setProfile(data.profile);
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading || !profile) {
    return <p className="text-sm text-muted-foreground">Loading member...</p>;
  }

  const hasDamageWarning = profile.damage_incidents >= 2;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{profile.member_id}</p>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            {profile.name}
            {hasDamageWarning && (
              <span title="2+ damage incidents">
                <AlertTriangle className="size-5 text-amber-600" aria-hidden />
              </span>
            )}
          </h1>
          <div className="mt-2">
            <MemberStatusBadge status={profile.status} membershipEnd={profile.membership_end} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/api/members/${memberId}/card`} target="_blank" variant="outline">
            <CreditCard className="size-4" />
            Print ID Card
          </LinkButton>
          <LinkButton href={`/admin/lending/new?member_id=${memberId}`}>
            <Plus className="size-4" />
            Lend a Book
          </LinkButton>
          <LinkButton href={`/admin/members/${memberId}/edit`} variant="outline">
            <Pencil className="size-4" />
            Edit
          </LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Books Out</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{profile.books_out}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Borrows</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{profile.total_borrows}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Damage Incidents</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{profile.damage_incidents}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Membership</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Type:</span> {profile.membership_type}</p>
          <p><span className="text-muted-foreground">Valid:</span> {profile.membership_start} → {profile.membership_end}</p>
          <p><span className="text-muted-foreground">Quota:</span> {profile.max_books_quota} books</p>
          <p><span className="text-muted-foreground">Deposit:</span> ₹{profile.deposit_amount}</p>
          <p><span className="text-muted-foreground">Contact:</span> {profile.parent_contact}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Active Loans</CardTitle></CardHeader>
        <CardContent>
          {profile.active_loans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active loans.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BBID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.active_loans.map((loan) => {
                  const days = daysUntil(loan.due_date);
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-mono text-sm">{loan.book.bbid}</TableCell>
                      <TableCell>{loan.book.title}</TableCell>
                      <TableCell>{loan.borrow_date}</TableCell>
                      <TableCell className={days < 0 ? "text-red-600 font-medium" : ""}>
                        {loan.due_date} {days < 0 ? `(${Math.abs(days)}d late)` : days >= 0 ? `(${days}d left)` : ""}
                      </TableCell>
                      <TableCell><LendingStatusBadge status={loan.status} /></TableCell>
                      <TableCell>
                        <Link href={`/admin/lending/${loan.id}/return`} className="text-primary underline text-sm">
                          Return
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Loan History</CardTitle></CardHeader>
        <CardContent>
          {profile.loan_history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past loans.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BBID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.loan_history.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-mono text-sm">{loan.book.bbid}</TableCell>
                    <TableCell>{loan.book.title}</TableCell>
                    <TableCell>{loan.borrow_date}</TableCell>
                    <TableCell>{loan.return_date ?? "—"}</TableCell>
                    <TableCell>{loan.condition_on_return ?? loan.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

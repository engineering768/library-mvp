"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MembershipType, Member } from "@/lib/supabase/types";
import { calcMembershipEnd } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type MemberFormProps = {
  member?: Member;
  mode: "create" | "edit";
};

export function MemberForm({ member, mode }: MemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState<MembershipType>(
    member?.membership_type ?? "Monthly"
  );
  const [membershipStart, setMembershipStart] = useState(
    member?.membership_start ?? new Date().toISOString().slice(0, 10)
  );
  const [membershipEnd, setMembershipEnd] = useState(
    member?.membership_end ?? calcMembershipEnd(membershipStart, membershipType)
  );

  useEffect(() => {
    if (mode === "create") {
      setMembershipEnd(calcMembershipEnd(membershipStart, membershipType));
    }
  }, [membershipStart, membershipType, mode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      age: form.get("age") ? Number(form.get("age")) : null,
      school_name: String(form.get("school_name") ?? "") || null,
      standard: String(form.get("standard") ?? "") || null,
      medium: String(form.get("medium") ?? "") || null,
      gender: String(form.get("gender") ?? "") || null,
      parent_name: String(form.get("parent_name") ?? "") || null,
      parent_contact: String(form.get("parent_contact") ?? ""),
      address: String(form.get("address") ?? "") || null,
      membership_type: membershipType,
      membership_start: membershipStart,
      membership_end: membershipEnd,
      deposit_amount: Number(form.get("deposit_amount") ?? 0),
      max_books_quota: Number(form.get("max_books_quota") ?? 2),
      status: String(form.get("status") ?? "Active"),
      notes: String(form.get("notes") ?? "") || null,
    };

    const url = mode === "create" ? "/api/members" : `/api/members/${member!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(`/admin/members/${data.member?.id ?? member!.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-6">
      {member && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <Label className="text-muted-foreground">Member ID</Label>
          <p className="text-lg font-semibold">{member.member_id}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={member?.name} required className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" defaultValue={member?.age ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input id="gender" name="gender" defaultValue={member?.gender ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school_name">School</Label>
          <Input id="school_name" name="school_name" defaultValue={member?.school_name ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="standard">Standard</Label>
          <Input id="standard" name="standard" defaultValue={member?.standard ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="medium">Medium</Label>
          <Input id="medium" name="medium" defaultValue={member?.medium ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parent_name">Parent Name</Label>
          <Input id="parent_name" name="parent_name" defaultValue={member?.parent_name ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parent_contact">Parent Contact (WhatsApp) *</Label>
          <Input id="parent_contact" name="parent_contact" defaultValue={member?.parent_contact} required className="min-h-11 text-base" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" name="address" defaultValue={member?.address ?? ""} rows={2} className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="membership_type">Membership Type</Label>
          <select
            id="membership_type"
            value={membershipType}
            onChange={(e) => setMembershipType(e.target.value as MembershipType)}
            className="flex min-h-11 w-full rounded-lg border px-3 text-base"
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Annual">Annual</option>
            <option value="Free">Free</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="membership_start">Start Date *</Label>
          <Input
            id="membership_start"
            type="date"
            value={membershipStart}
            onChange={(e) => setMembershipStart(e.target.value)}
            required
            className="min-h-11 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="membership_end">End Date *</Label>
          <Input
            id="membership_end"
            type="date"
            value={membershipEnd}
            onChange={(e) => setMembershipEnd(e.target.value)}
            required
            className="min-h-11 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_books_quota">Max Books Quota</Label>
          <Input id="max_books_quota" name="max_books_quota" type="number" defaultValue={member?.max_books_quota ?? 2} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit_amount">Deposit Amount</Label>
          <Input id="deposit_amount" name="deposit_amount" type="number" step="0.01" defaultValue={member?.deposit_amount ?? 0} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={member?.status ?? "Active"} className="flex min-h-11 w-full rounded-lg border px-3 text-base">
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={member?.notes ?? ""} rows={3} className="text-base" />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="fixed bottom-16 left-0 right-0 border-t bg-background p-4 md:static md:border-0 md:p-0">
        <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto min-h-11">
          {loading ? "Saving..." : mode === "create" ? "Create Member" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

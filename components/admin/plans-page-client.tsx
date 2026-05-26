"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import type { InviteCode, SubscriptionPlan } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InviteRow = InviteCode & { plan?: { name: string } };

export function PlansPageClient() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [expiringCodes, setExpiringCodes] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInvite, setNewInvite] = useState<{ planId: string; code: string } | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data.plans ?? []);
    setExpiringCodes(data.expiring_invites ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function savePlan(plan: SubscriptionPlan, form: HTMLFormElement) {
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name")),
      type: String(fd.get("type")),
      price: Number(fd.get("price")),
      validity_days: Number(fd.get("validity_days")),
      max_books_quota: Number(fd.get("max_books_quota")),
      is_free: fd.get("is_free") === "on",
      active: fd.get("active") === "on",
    };

    await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    fetchPlans();
  }

  async function generateInvite(planId: string) {
    const res = await fetch(`/api/plans/${planId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uses_max: 1, expires_in_days: 30 }),
    });
    const data = await res.json();
    if (data.success) {
      setNewInvite({ planId, code: data.invite.code });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscription Plans</h1>
        <p className="text-sm text-muted-foreground">
          Changes apply to new renewals only
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Quota</TableHead>
              <TableHead>Active</TableHead>
              <TableHead></TableHead>
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
              : plans.map((plan) => (
                  <TableRow key={plan.id}>
                    {editingId === plan.id ? (
                      <TableCell colSpan={7}>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            savePlan(plan, e.currentTarget);
                          }}
                          className="grid gap-3 py-2 sm:grid-cols-3"
                        >
                          <Input name="name" defaultValue={plan.name} className="min-h-11" />
                          <select name="type" defaultValue={plan.type} className="min-h-11 rounded-lg border px-3">
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Annual">Annual</option>
                            <option value="Free">Free</option>
                          </select>
                          <Input name="price" type="number" defaultValue={plan.price} className="min-h-11" />
                          <Input name="validity_days" type="number" defaultValue={plan.validity_days} className="min-h-11" />
                          <Input name="max_books_quota" type="number" defaultValue={plan.max_books_quota} className="min-h-11" />
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="is_free" defaultChecked={plan.is_free} /> Free
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="active" defaultChecked={plan.active} /> Active
                          </label>
                          <div className="flex gap-2 sm:col-span-3">
                            <Button type="submit" className="min-h-11">Save</Button>
                            <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </form>
                      </TableCell>
                    ) : (
                      <>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.type}</TableCell>
                        <TableCell>{Number(plan.price).toFixed(0)}</TableCell>
                        <TableCell>{plan.validity_days} days</TableCell>
                        <TableCell>{plan.max_books_quota}</TableCell>
                        <TableCell>
                          <Badge variant={plan.active ? "default" : "secondary"}>
                            {plan.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(plan.id)}>Edit</Button>
                          {plan.is_free && (
                            <Button variant="outline" size="sm" onClick={() => generateInvite(plan.id)}>
                              Invite Code
                            </Button>
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {newInvite && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium">New invite code</p>
          <p className="mt-1 font-mono text-lg">{newInvite.code}</p>
          <p className="mt-2 text-xs text-muted-foreground">Valid for 30 days · single use</p>
        </div>
      )}

      {expiringCodes.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Invite codes expiring soon</h2>
          <ul className="space-y-2 text-sm">
            {expiringCodes.map((code) => (
              <li key={code.id} className="rounded-lg border p-3">
                <span className="font-mono">{code.code}</span>
                {" · "}
                {code.plan?.name}
                {" · expires "}
                {code.expires_at ? format(new Date(code.expires_at), "d MMM yyyy") : "—"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

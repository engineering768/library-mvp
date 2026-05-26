"use client";

import { useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import type { SubscriptionPlan } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";

const CONTACT_WHATSAPP = "919876543210";

export function MembershipPageClient() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/plans")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans ?? []);
        setLoading(false);
      });
  }, []);

  const paidPlans = plans.filter((p) => !p.is_free);
  const freePlan = plans.find((p) => p.is_free);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Membership Plans</h1>
        <p className="mt-1 text-muted-foreground">
          Borrow books home from the Prerna library. Choose a plan that fits your family.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {paidPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col border-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.type === "Annual" && (
                    <Badge variant="secondary">Best value</Badge>
                  )}
                </div>
                <p className="text-3xl font-bold">₹{Number(plan.price).toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">per {plan.validity_days} days</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    Borrow up to {plan.max_books_quota} books at a time
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    {plan.validity_days}-day membership
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    Curated children&apos;s collection
                  </li>
                </ul>
                <a
                  href={`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(`Hi, I'd like to join the ${plan.name} membership plan.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <MessageCircle className="size-4" />
                  Enquire on WhatsApp
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {freePlan && !loading && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">{freePlan.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Try the library with {freePlan.max_books_quota} book for {freePlan.validity_days} days — invite code required.
            </p>
          </CardHeader>
          <CardContent>
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent("Hi, I have an invite code for the free trial membership.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <MessageCircle className="size-4" />
              Contact us with your invite code
            </a>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">How it works</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Browse the catalogue and pick books you love.</li>
          <li>Visit the library or message us on WhatsApp to sign up.</li>
          <li>Pay at the library (or online when enabled) and start borrowing.</li>
          <li>Return books on time — no automatic fines; we&apos;ll remind you gently.</li>
        </ol>
        <LinkButton href="/catalogue" variant="outline" className="mt-4">
          Browse catalogue
        </LinkButton>
      </div>
    </div>
  );
}

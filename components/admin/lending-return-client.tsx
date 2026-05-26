"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LendingWithDetails } from "@/lib/supabase/types";
import { daysUntil } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LendingReturnClientProps = { lendingId: string };

export function LendingReturnClient({ lendingId }: LendingReturnClientProps) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<LendingWithDetails | null>(null);
  const [condition, setCondition] = useState<"Good" | "Worn" | "Damaged">("Good");
  const [damageNote, setDamageNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/lending/${lendingId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTransaction(d.transaction);
      });
  }, [lendingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/lending/${lendingId}/return`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        condition_on_return: condition,
        damage_note: condition === "Damaged" ? damageNote : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Failed to return");
      return;
    }

    router.push("/admin/lending");
    router.refresh();
  }

  if (!transaction) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const daysLate = daysUntil(transaction.due_date);
  const isLate = daysLate < 0;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <LinkButton href="/admin/lending" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Lending
      </LinkButton>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Record Return</h1>
        <p className="text-sm text-muted-foreground">{transaction.transaction_id}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Loan Details</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><strong>Member:</strong> {transaction.member.name}</p>
          <p><strong>Book:</strong> {transaction.book.bbid} — {transaction.book.title}</p>
          <p><strong>Borrowed:</strong> {transaction.borrow_date}</p>
          <p><strong>Due:</strong> {transaction.due_date}</p>
          {isLate && (
            <p className="text-red-600 font-medium">{Math.abs(daysLate)} days late</p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Condition on Return</Label>
          <div className="flex flex-wrap gap-4">
            {(["Good", "Worn", "Damaged"] as const).map((c) => (
              <label key={c} className="flex items-center gap-2 min-h-11">
                <input type="radio" checked={condition === c} onChange={() => setCondition(c)} />
                {c}
              </label>
            ))}
          </div>
        </div>

        {condition === "Damaged" && (
          <div className="space-y-2">
            <Label htmlFor="damage_note">Damage Note</Label>
            <Input
              id="damage_note"
              value={damageNote}
              onChange={(e) => setDamageNote(e.target.value)}
              placeholder="Describe damage..."
              className="min-h-11 text-base"
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="min-h-11 w-full">
          {loading ? "Saving..." : "✓ Mark Returned"}
        </Button>
      </form>
    </div>
  );
}

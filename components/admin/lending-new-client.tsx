"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Book, Member } from "@/lib/supabase/types";
import { calcDueDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LendingNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMember = searchParams.get("member_id") ?? "";

  const [memberSearch, setMemberSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [condition, setCondition] = useState<"Good" | "Worn" | "Damaged">("Good");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLoans, setActiveLoans] = useState(0);

  useEffect(() => {
    if (preselectedMember) {
      fetch(`/api/members/${preselectedMember}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setSelectedMember(d.profile);
        });
    }
  }, [preselectedMember]);

  useEffect(() => {
    if (!memberSearch) return;
    const timer = setTimeout(() => {
      fetch(`/api/members?search=${encodeURIComponent(memberSearch)}&status=Active`)
        .then((r) => r.json())
        .then((d) => setMembers(d.members ?? []));
    }, 250);
    return () => clearTimeout(timer);
  }, [memberSearch]);

  const fetchBooks = useCallback(async () => {
    const params = new URLSearchParams({ status: "Available", limit: "50" });
    if (bookSearch) params.set("search", bookSearch);
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    setBooks(data.books ?? []);
  }, [bookSearch]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 250);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  useEffect(() => {
    if (!selectedMember) return;
    fetch(`/api/lending?member_id=${selectedMember.id}`)
      .then((r) => r.json())
      .then((d) => {
        const count = (d.lending ?? []).filter(
          (l: { status: string }) => l.status === "Active" || l.status === "Overdue"
        ).length;
        setActiveLoans(count);
      });
  }, [selectedMember]);

  const today = new Date().toISOString().slice(0, 10);
  const quotaExceeded = selectedMember ? activeLoans >= selectedMember.max_books_quota : false;
  const membershipExpired = selectedMember ? selectedMember.membership_end < today : false;
  const memberInactive = selectedMember ? selectedMember.status !== "Active" : false;
  const dueDate = selectedBook ? calcDueDate(today, selectedBook.rental_validity) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMember || !selectedBook) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/lending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: selectedMember.id,
        book_id: selectedBook.id,
        condition_on_borrow: condition,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Failed to create lending");
      return;
    }

    router.push(`/admin/members/${selectedMember.id}`);
    router.refresh();
  }

  async function addToWaitlist() {
    if (!selectedBook) return;
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: selectedBook.id,
        member_id: selectedMember?.id,
        contact: selectedMember?.parent_contact,
      }),
    });
    setError("Added to waitlist — Prema will notify when available.");
  }

  const blocked = quotaExceeded || membershipExpired || memberInactive;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Lending</h1>
        <p className="text-sm text-muted-foreground">Fast borrow — member + book</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Member *</Label>
          {selectedMember ? (
            <div className="rounded-lg border p-3">
              <p className="font-medium">{selectedMember.name} ({selectedMember.member_id})</p>
              <p className="text-sm text-muted-foreground">
                Quota: {activeLoans}/{selectedMember.max_books_quota} · Expires {selectedMember.membership_end}
              </p>
              <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => setSelectedMember(null)}>
                Change
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search member name or ID..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="min-h-11 pl-9 text-base"
                />
              </div>
              {members.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-lg border">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="block w-full border-b p-3 text-left last:border-0 hover:bg-muted/40"
                      onClick={() => { setSelectedMember(m); setMembers([]); setMemberSearch(""); }}
                    >
                      {m.name} · {m.member_id}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {quotaExceeded && <p className="text-sm text-destructive">Return a book first to borrow another.</p>}
          {membershipExpired && <p className="text-sm text-destructive">Membership has expired.</p>}
          {memberInactive && <p className="text-sm text-destructive">Member is not active.</p>}
        </div>

        <div className="space-y-2">
          <Label>Book *</Label>
          {selectedBook ? (
            <div className="rounded-lg border p-3">
              <p className="font-mono text-xs">{selectedBook.bbid}</p>
              <p className="font-medium">{selectedBook.title}</p>
              <p className="text-sm text-muted-foreground">Stock: {selectedBook.stock} · {selectedBook.status}</p>
              <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => setSelectedBook(null)}>
                Change
              </Button>
              {selectedBook.stock <= 0 && (
                <Button type="button" variant="outline" size="sm" className="ml-2" onClick={addToWaitlist}>
                  Add to waitlist
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search BBID or title..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="min-h-11 pl-9 text-base"
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border">
                {books.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="block w-full border-b p-3 text-left last:border-0 hover:bg-muted/40"
                    onClick={() => { setSelectedBook(b); setBookSearch(""); }}
                  >
                    <span className="font-mono text-xs">{b.bbid}</span> — {b.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {dueDate && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <Label className="text-muted-foreground">Due Date (auto)</Label>
            <p className="text-lg font-semibold">{dueDate}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Condition on Borrow</Label>
          <div className="flex flex-wrap gap-4">
            {(["Good", "Worn", "Damaged"] as const).map((c) => (
              <label key={c} className="flex items-center gap-2 min-h-11">
                <input type="radio" name="condition" checked={condition === c} onChange={() => setCondition(c)} />
                {c}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={loading || blocked || !selectedMember || !selectedBook || (selectedBook?.stock ?? 0) <= 0}
          className="min-h-11 w-full"
        >
          {loading ? "Creating..." : "✓ Create Lending"}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Search, X } from "lucide-react";
import type { Book, School } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSchool = searchParams.get("school_id") ?? "";

  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookSearch, setBookSearch] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

  const [form, setForm] = useState({
    school_id: preselectedSchool,
    date: new Date().toISOString().slice(0, 10),
    class_grade: "",
    division: "",
    approx_student_count: "",
    conducted_by: "Prema",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/schools?active=true")
      .then((r) => r.json())
      .then((d) => setSchools(d.schools ?? []));
  }, []);

  const fetchBooks = useCallback(async () => {
    const params = new URLSearchParams({ status: "Available", limit: "100" });
    if (bookSearch) params.set("search", bookSearch);

    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    setBooks(data.books ?? []);
  }, [bookSearch]);

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(fetchBooks, 250);
      return () => clearTimeout(timer);
    }
  }, [step, fetchBooks]);

  function toggleBook(book: Book) {
    setSelectedBooks((prev) =>
      prev.some((b) => b.id === book.id)
        ? prev.filter((b) => b.id !== book.id)
        : [...prev, book]
    );
  }

  async function createSession() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        approx_student_count: form.approx_student_count
          ? Number(form.approx_student_count)
          : null,
        book_ids: selectedBooks.map((b) => b.id),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error ?? "Failed to create session");
      return;
    }

    setCreatedSessionId(data.session.id);
    setStep(3);
  }

  const selectedSchool = schools.find((s) => s.id === form.school_id);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Session</h1>
        <p className="text-sm text-muted-foreground">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Session Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="school_id">School *</Label>
              <select
                id="school_id"
                value={form.school_id}
                onChange={(e) => setForm({ ...form, school_id: e.target.value })}
                className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
                required
              >
                <option value="">Select school</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.school_id})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="min-h-11 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_grade">Class / Grade</Label>
              <Input id="class_grade" value={form.class_grade} onChange={(e) => setForm({ ...form, class_grade: e.target.value })} placeholder="Std 3" className="min-h-11 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Input id="division" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} placeholder="A" className="min-h-11 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approx_student_count">Approx. Students</Label>
              <Input id="approx_student_count" type="number" value={form.approx_student_count} onChange={(e) => setForm({ ...form, approx_student_count: e.target.value })} className="min-h-11 text-base" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="conducted_by">Conducted By</Label>
              <Input id="conducted_by" value={form.conducted_by} onChange={(e) => setForm({ ...form, conducted_by: e.target.value })} className="min-h-11 text-base" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="text-base" />
            </div>
            <div className="md:col-span-2">
              <Button type="button" disabled={!form.school_id} onClick={() => setStep(2)} className="min-h-11 w-full md:w-auto">
                Next →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Select Books</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search available books..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="min-h-11 pl-9 text-base"
                />
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {books.map((book) => {
                  const selected = selectedBooks.some((b) => b.id === book.id);
                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => toggleBook(book)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${selected ? "border-primary bg-primary/5" : ""}`}
                    >
                      <div className="flex-1">
                        <p className="font-mono text-xs text-muted-foreground">{book.bbid}</p>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-muted-foreground">{book.author ?? "Unknown"}</p>
                      </div>
                      {selected && <Check className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="min-h-11">← Back</Button>
                <Button
                  onClick={createSession}
                  disabled={loading || selectedBooks.length === 0}
                  className="min-h-11 flex-1"
                >
                  {loading ? "Creating..." : "Confirm & Create Session →"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bag ({selectedBooks.length} books)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedBooks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tap books to add them to the bag.</p>
              ) : (
                selectedBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-mono text-xs">{book.bbid}</p>
                      <p className="text-sm font-medium">{book.title}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => toggleBook(book)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && createdSessionId && (
        <Card>
          <CardHeader><CardTitle className="text-base">Session Created</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p><strong>School:</strong> {selectedSchool?.name}</p>
            <p><strong>Date:</strong> {form.date}</p>
            <p><strong>Class:</strong> {[form.class_grade, form.division].filter(Boolean).join(" ") || "—"}</p>
            <p><strong>Books:</strong> {selectedBooks.length}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <LinkButton href={`/api/sessions/${createdSessionId}/sheet`} target="_blank" variant="outline">
                Print Session Sheet
              </LinkButton>
              <Button variant="outline" onClick={() => setStep(2)} className="min-h-11">← Edit</Button>
              <Button onClick={() => router.push(`/admin/sessions/${createdSessionId}`)} className="min-h-11">
                ✓ Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

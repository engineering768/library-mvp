"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Book } from "@/lib/supabase/types";

const AGE_GROUPS = ["3-6", "5-8", "6-10", "8-12", "10+"];
const LANGUAGES = ["English", "Hindi", "Marathi"];
const FORMATS = ["Paperback", "Hardcover", "Wordless", "Board Book"];
const CONDITIONS = ["Good", "Worn", "Damaged"];
const MANUAL_STATUSES = ["Available", "Retired", "Damaged"];

type BookFormProps = {
  book?: Book;
  mode: "create" | "edit";
};

export function BookForm({ book, mode }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      author: String(form.get("author") ?? "") || null,
      illustrator: String(form.get("illustrator") ?? "") || null,
      publisher: String(form.get("publisher") ?? "") || null,
      year: form.get("year") ? Number(form.get("year")) : null,
      language: String(form.get("language") ?? "") || null,
      age_group: String(form.get("age_group") ?? "") || null,
      genre_1: String(form.get("genre_1") ?? "") || null,
      genre_2: String(form.get("genre_2") ?? "") || null,
      genre_3: String(form.get("genre_3") ?? "") || null,
      theme: String(form.get("theme") ?? "") || null,
      awards: String(form.get("awards") ?? "") || null,
      format: String(form.get("format") ?? "Paperback"),
      isbn: String(form.get("isbn") ?? "") || null,
      condition: String(form.get("condition") ?? "Good"),
      status: String(form.get("status") ?? "Available"),
      physical_label: form.get("physical_label") === "on",
      blog_link_en: String(form.get("blog_link_en") ?? "") || null,
      blog_link_mr: String(form.get("blog_link_mr") ?? "") || null,
      activity_notes: String(form.get("activity_notes") ?? "") || null,
      rental_validity: Number(form.get("rental_validity") ?? 14),
      stock: Number(form.get("stock") ?? 1),
      total_copies: Number(form.get("total_copies") ?? 1),
    };

    const url = mode === "create" ? "/api/books" : `/api/books/${book!.id}`;
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

    router.push(`/admin/books/${data.book.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-6">
      {book && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <Label className="text-muted-foreground">BBID</Label>
          <p className="text-lg font-semibold">{book.bbid}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" defaultValue={book?.title} required className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input id="author" name="author" defaultValue={book?.author ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="illustrator">Illustrator</Label>
          <Input id="illustrator" name="illustrator" defaultValue={book?.illustrator ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publisher">Publisher</Label>
          <Input id="publisher" name="publisher" defaultValue={book?.publisher ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" defaultValue={book?.year ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select id="language" name="language" defaultValue={book?.language ?? ""} className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            <option value="">Select language</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="age_group">Age Group</Label>
          <select id="age_group" name="age_group" defaultValue={book?.age_group ?? ""} className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            <option value="">Select age group</option>
            {AGE_GROUPS.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <select id="format" name="format" defaultValue={book?.format ?? "Paperback"} className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            {FORMATS.map((format) => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre_1">Genre 1</Label>
          <Input id="genre_1" name="genre_1" defaultValue={book?.genre_1 ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre_2">Genre 2</Label>
          <Input id="genre_2" name="genre_2" defaultValue={book?.genre_2 ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre_3">Genre 3</Label>
          <Input id="genre_3" name="genre_3" defaultValue={book?.genre_3 ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Input id="theme" name="theme" defaultValue={book?.theme ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="awards">Awards</Label>
          <Input id="awards" name="awards" defaultValue={book?.awards ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input id="isbn" name="isbn" defaultValue={book?.isbn ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <select id="condition" name="condition" defaultValue={book?.condition ?? "Good"} className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={book?.status ?? "Available"} className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base">
            {MANUAL_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rental_validity">Rental Validity (days)</Label>
          <Input id="rental_validity" name="rental_validity" type="number" defaultValue={book?.rental_validity ?? 14} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={book?.stock ?? 1} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_copies">Total Copies</Label>
          <Input id="total_copies" name="total_copies" type="number" defaultValue={book?.total_copies ?? 1} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="blog_link_en">Blog Link (English)</Label>
          <Input id="blog_link_en" name="blog_link_en" type="url" defaultValue={book?.blog_link_en ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="blog_link_mr">Blog Link (Marathi)</Label>
          <Input id="blog_link_mr" name="blog_link_mr" type="url" defaultValue={book?.blog_link_mr ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="activity_notes">Activity Notes</Label>
          <Textarea id="activity_notes" name="activity_notes" defaultValue={book?.activity_notes ?? ""} rows={3} className="text-base" />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <Checkbox id="physical_label" name="physical_label" defaultChecked={book?.physical_label} />
          <Label htmlFor="physical_label">Physical label applied</Label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="fixed bottom-16 left-0 right-0 border-t bg-background p-4 md:static md:border-0 md:p-0">
        <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto min-h-11">
          {loading ? "Saving..." : mode === "create" ? "Create Book" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

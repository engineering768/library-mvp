"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Blog } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BookOption = { id: string; title: string; bbid: string };

type BlogFormProps = {
  blog?: Blog;
  mode: "create" | "edit";
};

const BLOG_TYPES = ["On Author/Book", "भेटायला"];

export function BlogForm({ blog, mode }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [linkedBooks, setLinkedBooks] = useState<string[]>(blog?.linked_books ?? []);
  const [published, setPublished] = useState(blog?.published ?? false);

  useEffect(() => {
    fetch("/api/books?limit=200")
      .then((res) => res.json())
      .then((data) => setBooks(data.books ?? []));
  }, []);

  function toggleBook(id: string) {
    setLinkedBooks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title_en: String(form.get("title_en") ?? "") || null,
      title_mr: String(form.get("title_mr") ?? "") || null,
      type: String(form.get("type") ?? ""),
      external_url: String(form.get("external_url") ?? "") || null,
      content: String(form.get("content") ?? "") || null,
      linked_author: String(form.get("linked_author") ?? "") || null,
      linked_books: linkedBooks,
      published,
    };

    const url = mode === "create" ? "/api/blogs" : `/api/blogs/${blog!.id}`;
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

    router.push("/admin/blogs");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title_en">Title (English)</Label>
          <Input id="title_en" name="title_en" defaultValue={blog?.title_en ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_mr">Title (Marathi)</Label>
          <Input id="title_mr" name="title_mr" defaultValue={blog?.title_mr ?? ""} className="min-h-11 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <select id="type" name="type" defaultValue={blog?.type ?? BLOG_TYPES[0]} required className="min-h-11 w-full rounded-lg border px-3 text-base">
            {BLOG_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="external_url">External URL</Label>
          <Input id="external_url" name="external_url" type="url" defaultValue={blog?.external_url ?? ""} className="min-h-11 text-base" />
          <p className="text-xs text-muted-foreground">Optional if you add content below</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            name="content"
            defaultValue={blog?.content ?? ""}
            rows={12}
            className="w-full rounded-lg border px-3 py-2 text-base"
            placeholder="Full blog text (shown on /blogs/[slug])"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="linked_author">Linked Author</Label>
          <Input id="linked_author" name="linked_author" defaultValue={blog?.linked_author ?? ""} className="min-h-11 text-base" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Link Books</Label>
        <div className="max-h-48 overflow-y-auto rounded-lg border p-3 space-y-2">
          {books.length ? books.map((book) => (
            <label key={book.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={linkedBooks.includes(book.id)}
                onChange={() => toggleBook(book.id)}
              />
              <span>{book.title} ({book.bbid})</span>
            </label>
          )) : (
            <p className="text-sm text-muted-foreground">Loading books...</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="min-h-11">
        {loading ? "Saving..." : mode === "create" ? "Create Blog" : "Save Changes"}
      </Button>
    </form>
  );
}

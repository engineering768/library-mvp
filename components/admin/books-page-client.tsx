"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Download, MapPin, Plus, Search, Tag, Upload, X } from "lucide-react";
import type { Book } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";

export function BooksPageClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [language, setLanguage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (language) params.set("language", language);

    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    setBooks(data.books ?? []);
    setLoading(false);
  }, [search, status, language]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 250);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function markLabels(applied: boolean) {
    if (!selected.length) return;
    await fetch("/api/books", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, physical_label: applied }),
    });
    setSelected([]);
    fetchBooks();
  }

  function exportSelected() {
    const params = selected.length ? `?ids=${selected.join(",")}` : "";
    window.open(`/api/books/export${params}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Books</h1>
          <p className="text-sm text-muted-foreground">Manage your catalog and BBIDs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin/books/locate" variant="outline">
            <MapPin className="size-4" />
            Locate Book
          </LinkButton>
          <LinkButton href="/admin/books/import" variant="outline">
            <Upload className="size-4" />
            Import CSV
          </LinkButton>
          <LinkButton href="/admin/books/new">
            <Plus className="size-4" />
            Add Book
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, author, BBID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 pl-9 text-base"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="min-h-11 rounded-lg border border-input bg-background px-3 text-base"
        >
          <option value="">All statuses</option>
          <option value="Available">Available</option>
          <option value="Out - Session">Out - Session</option>
          <option value="Out - Member">Out - Member</option>
          <option value="Missing">Missing</option>
          <option value="Damaged">Damaged</option>
          <option value="Retired">Retired</option>
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="min-h-11 rounded-lg border border-input bg-background px-3 text-base"
        >
          <option value="">All languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Marathi">Marathi</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3">
          <span className="text-sm">{selected.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => markLabels(true)}>
            <Tag className="size-4" />
            Mark Label Applied
          </Button>
          <Button size="sm" variant="outline" onClick={exportSelected}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      )}

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>BBID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(book.id)}
                        onCheckedChange={() => toggleSelect(book.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <Link href={`/admin/books/${book.id}`} className="hover:underline">
                        {book.bbid}
                      </Link>
                    </TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author ?? "—"}</TableCell>
                    <TableCell>{book.language ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={book.status} />
                    </TableCell>
                    <TableCell>
                      {book.physical_label ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <X className="size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))
          : books.map((book) => (
              <Link
                key={book.id}
                href={`/admin/books/${book.id}`}
                className="block rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{book.bbid}</p>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author ?? "Unknown author"}</p>
                  </div>
                  <StatusBadge status={book.status} />
                </div>
              </Link>
            ))}
      </div>

      {!loading && books.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No books yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Import your catalog CSV or add your first book.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <LinkButton href="/admin/books/import" variant="outline">
              Import CSV
            </LinkButton>
            <LinkButton href="/admin/books/new">Add Book</LinkButton>
          </div>
        </div>
      )}
    </div>
  );
}

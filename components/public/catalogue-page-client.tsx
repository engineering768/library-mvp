"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PublicBook = {
  id: string;
  bbid: string;
  title: string;
  author: string | null;
  language: string | null;
  age_group: string | null;
  genre_1: string | null;
  format: string | null;
  status: string;
  stock: number;
};

export function CataloguePageClient() {
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (language) params.set("language", language);
    if (ageGroup) params.set("age_group", ageGroup);
    if (availableOnly) params.set("available_only", "true");

    const res = await fetch(`/api/public/books?${params}`);
    const data = await res.json();
    setBooks(data.books ?? []);
    setLoading(false);
  }, [search, language, ageGroup, availableOnly]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 250);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Book Catalogue</h1>
        <p className="text-sm text-muted-foreground">
          Browse our collection — borrow at the library or join the waitlist
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 pl-9 text-base"
          />
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="min-h-11 rounded-lg border px-3 text-base"
        >
          <option value="">All languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Marathi">Marathi</option>
        </select>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="min-h-11 rounded-lg border px-3 text-base"
        >
          <option value="">All ages</option>
          <option value="0-3">0–3</option>
          <option value="3-6">3–6</option>
          <option value="5-10">5–10</option>
          <option value="8-12">8–12</option>
        </select>
      </div>

      <label className="flex min-h-11 w-fit items-center gap-2 rounded-lg border px-3 text-sm">
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => setAvailableOnly(e.target.checked)}
        />
        Available only
      </label>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : books.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const available = book.status === "Available" && book.stock > 0;
            return (
              <Link key={book.id} href={`/catalogue/${book.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-base">{book.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{book.author ?? "Unknown author"}</p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {book.language && <Badge variant="secondary">{book.language}</Badge>}
                    {book.age_group && <Badge variant="outline">{book.age_group}</Badge>}
                    <Badge variant={available ? "default" : "destructive"}>
                      {available ? "Available" : "Not available"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No books match your filters.</p>
      )}
    </div>
  );
}

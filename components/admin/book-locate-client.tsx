"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { BookLocation } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";

export function BookLocateClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/books/search-location?q=${encodeURIComponent(query.trim())}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Where is my book?</h1>
        <p className="text-sm text-muted-foreground">Search by BBID or title</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="BB-2026-0001 or book title..."
          className="min-h-14 pl-12 text-lg"
        />
        <Button type="submit" disabled={loading} className="mt-3 min-h-11 w-full">
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {searched && results.length === 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground">No books found.</p>
      )}

      <div className="space-y-3">
        {results.map((item) => (
          <Card key={item.book.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{item.book.title}</CardTitle>
                  <p className="font-mono text-sm text-muted-foreground">{item.book.bbid}</p>
                </div>
                <StatusBadge status={item.book.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {item.current_session && (
                <p>
                  <strong>Location:</strong> {item.current_session.school_name} (Session {item.current_session.session_id}, {item.current_session.status})
                </p>
              )}
              {item.missing_from_session && (
                <p className="text-red-700">
                  <strong>Missing from:</strong> {item.missing_from_session.school_name} on {item.missing_from_session.date} (Session {item.missing_from_session.session_id})
                </p>
              )}
              {item.current_member && (
                <p>
                  <strong>Location:</strong> With member {item.current_member.member_name} ({item.current_member.member_id}) — due {item.current_member.due_date}
                </p>
              )}
              {!item.current_session && !item.current_member && !item.missing_from_session && item.book.status === "Available" && (
                <p><strong>Location:</strong> In library (available)</p>
              )}
              {item.last_seen && (
                <p className="text-muted-foreground">Last seen: {item.last_seen}</p>
              )}
              <Link href={`/admin/books/${item.book.id}`} className="text-primary underline">
                View book details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

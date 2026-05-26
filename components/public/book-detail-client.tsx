"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Book } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkButton } from "@/components/ui/link-button";

type BookDetailClientProps = { bookId: string };

export function BookDetailClient({ bookId }: BookDetailClientProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/public/books/${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBook(data.book);
          setWaitlistCount(data.waitlist_count ?? 0);
          setIsAvailable(data.is_available ?? false);
        }
        setLoading(false);
      });
  }, [bookId]);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/public/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId, name, contact }),
    });
    const data = await res.json();

    if (data.success) {
      setMessage("You're on the waitlist! We'll notify you when it's back.");
      setWaitlistCount((c) => c + 1);
      setName("");
      setContact("");
    } else {
      setMessage(data.error ?? "Could not join waitlist");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!book) {
    return <p className="text-muted-foreground">Book not found.</p>;
  }

  return (
    <div className="space-y-6">
      <LinkButton href="/catalogue" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to catalogue
      </LinkButton>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{book.title}</h1>
        <p className="mt-1 text-muted-foreground">{book.author ?? "Unknown author"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {book.language && <Badge variant="secondary">{book.language}</Badge>}
          {book.age_group && <Badge variant="outline">{book.age_group}</Badge>}
          {book.format && <Badge variant="outline">{book.format}</Badge>}
          <Badge variant={isAvailable ? "default" : "destructive"}>
            {isAvailable ? "Available" : book.status}
          </Badge>
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {book.illustrator && (
          <>
            <dt className="text-muted-foreground">Illustrator</dt>
            <dd>{book.illustrator}</dd>
          </>
        )}
        {book.publisher && (
          <>
            <dt className="text-muted-foreground">Publisher</dt>
            <dd>{book.publisher}</dd>
          </>
        )}
        {book.year && (
          <>
            <dt className="text-muted-foreground">Year</dt>
            <dd>{book.year}</dd>
          </>
        )}
        {book.genre_1 && (
          <>
            <dt className="text-muted-foreground">Genre</dt>
            <dd>{book.genre_1}</dd>
          </>
        )}
        {book.theme && (
          <>
            <dt className="text-muted-foreground">Theme</dt>
            <dd>{book.theme}</dd>
          </>
        )}
      </dl>

      {(book.blog_link_en || book.blog_link_mr) && (
        <div className="flex flex-wrap gap-2">
          {book.blog_link_en && (
            <a
              href={book.blog_link_en}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
            >
              English blog <ExternalLink className="size-4" />
            </a>
          )}
          {book.blog_link_mr && (
            <a
              href={book.blog_link_mr}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
            >
              Marathi blog <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      )}

      {!isAvailable && (
        <div className="rounded-lg border p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {waitlistCount > 0
              ? `${waitlistCount} ${waitlistCount === 1 ? "person is" : "people are"} waiting for this book`
              : "Be the first to get notified when this book is back"}
          </p>
          <form onSubmit={handleWaitlist} className="space-y-3">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="min-h-11 text-base"
            />
            <Input
              placeholder="WhatsApp / phone"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="min-h-11 text-base"
            />
            <Button type="submit" disabled={submitting} className="min-h-11 w-full sm:w-auto">
              {submitting ? "Joining..." : "Notify Me"}
            </Button>
          </form>
          {message && <p className="text-sm text-primary">{message}</p>}
        </div>
      )}
    </div>
  );
}

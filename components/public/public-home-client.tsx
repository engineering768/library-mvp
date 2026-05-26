"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, CreditCard, PenLine } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type PublicBook = {
  id: string;
  title: string;
  author: string | null;
  language: string | null;
  status: string;
  stock: number;
};

type PublicBlog = {
  id: string;
  slug: string;
  title_en: string | null;
  title_mr: string | null;
  type: string;
  linked_author: string | null;
};

type PublicEvent = {
  id: string;
  title: string;
  date: string;
  venue: string | null;
  rsvp_count?: number;
  max_capacity: number | null;
};

type PublicPlan = {
  id: string;
  name: string;
  type: string;
  price: number;
  validity_days: number;
  max_books_quota: number;
  is_free: boolean;
};

export function PublicHomeClient() {
  const [books, setBooks] = useState<PublicBook[]>([]);
  const [blogs, setBlogs] = useState<PublicBlog[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/books?limit=4").then((r) => r.json()),
      fetch("/api/public/blogs").then((r) => r.json()),
      fetch("/api/public/events").then((r) => r.json()),
      fetch("/api/public/plans").then((r) => r.json()),
    ]).then(([booksRes, blogsRes, eventsRes, plansRes]) => {
      setBooks(booksRes.books ?? []);
      setBlogs((blogsRes.blogs ?? []).slice(0, 2));
      setEvents((eventsRes.events ?? []).slice(0, 2));
      setPlans((plansRes.plans ?? []).filter((p: PublicPlan) => !p.is_free).slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-12 pb-8">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-muted/40 px-6 py-10 sm:px-10">
        <p className="text-sm font-medium text-primary">Prerna Community Library</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Discover books, stories & events for every young reader
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Browse our catalogue, read Prerna&apos;s blog features, join library events, or become a member to borrow books home.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/catalogue" size="lg">
            <BookOpen className="size-4" />
            Browse Catalogue
          </LinkButton>
          <LinkButton href="/membership" variant="outline" size="lg">
            <CreditCard className="size-4" />
            Membership Plans
          </LinkButton>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Featured Books</h2>
            <p className="text-sm text-muted-foreground">From the Prerna collection</p>
          </div>
          <Link href="/catalogue" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      <Badge variant={available ? "default" : "destructive"}>
                        {available ? "Available" : "Waitlist"}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">From the Blog</h2>
            <p className="text-sm text-muted-foreground">Author features &amp; book reviews</p>
          </div>
          <Link href="/blogs" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
            All blogs <ArrowRight className="size-4" />
          </Link>
        </div>
        {loading ? (
          <Skeleton className="h-32 rounded-lg" />
        ) : blogs.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">{blog.type}</Badge>
                    <CardTitle className="text-base">
                      {blog.title_en || blog.title_mr}
                    </CardTitle>
                    {blog.linked_author && (
                      <p className="text-sm text-muted-foreground">{blog.linked_author}</p>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Blog posts coming soon.</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <p className="text-sm text-muted-foreground">Story circles, camps &amp; gatherings</p>
          </div>
          <Link href="/events" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
            All events <ArrowRight className="size-4" />
          </Link>
        </div>
        {loading ? (
          <Skeleton className="h-32 rounded-lg" />
        ) : events.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-4 text-primary" />
                    <div>
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), "EEE, d MMM · h:mm a")}
                        {event.venue ? ` · ${event.venue}` : ""}
                      </p>
                      {event.max_capacity != null && (
                        <p className="mt-1 text-xs font-medium">
                          {event.rsvp_count ?? 0} / {event.max_capacity} spots filled
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <LinkButton href="/events" variant="outline" size="sm">
                    RSVP on events page
                  </LinkButton>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming events right now.</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Membership</h2>
            <p className="text-sm text-muted-foreground">Borrow books home on a subscription</p>
          </div>
          <Link href="/membership" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
            Compare plans <ArrowRight className="size-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-2xl font-bold">
                    {Number(plan.price) === 0 ? "Free" : `₹${Number(plan.price).toFixed(0)}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {plan.validity_days} days · {plan.max_books_quota} books at a time
                  </p>
                </CardHeader>
                <CardContent className="mt-auto">
                  <LinkButton href="/membership" variant="outline" className="w-full">
                    Learn more
                  </LinkButton>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-muted/30 p-6 text-center sm:p-8">
        <PenLine className="mx-auto size-8 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">Visit the library or get in touch</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Membership sign-up and book borrowing are handled at the library. Browse online, then visit us to join or borrow.
        </p>
        <LinkButton href="/catalogue" className="mt-4">
          Start browsing books
        </LinkButton>
      </section>
    </div>
  );
}

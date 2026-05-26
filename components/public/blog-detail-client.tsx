"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Blog, Book } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type BlogDetailClientProps = { slug: string };

export function BlogDetailClient({ slug }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [linkedBooks, setLinkedBooks] = useState<Pick<Book, "id" | "title" | "author">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/blogs/${slug}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.success) {
          setLoading(false);
          return;
        }
        setBlog(data.blog);
        const ids: string[] = data.blog.linked_books ?? [];
        if (ids.length) {
          const books = await Promise.all(
            ids.map((id) =>
              fetch(`/api/public/books/${id}`).then((r) => r.json()).then((d) => d.book)
            )
          );
          setLinkedBooks(books.filter(Boolean));
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!blog) {
    return <p className="text-muted-foreground">Blog not found.</p>;
  }

  const title = blog.title_en || blog.title_mr || blog.type;
  const isMarathi = blog.type === "भेटायला";

  return (
    <article className="space-y-6">
      <LinkButton href="/blogs" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to blogs
      </LinkButton>

      <header className="space-y-2">
        <Badge variant="secondary">{blog.type}</Badge>
        <h1 className={`text-2xl font-semibold tracking-tight ${isMarathi ? "font-[family-name:var(--font-geist-sans)]" : ""}`}>
          {title}
        </h1>
        {blog.linked_author && (
          <p className="text-muted-foreground">{blog.linked_author}</p>
        )}
      </header>

      {blog.content ? (
        <div
          className={`prose prose-neutral max-w-none whitespace-pre-wrap text-base leading-relaxed dark:prose-invert ${isMarathi ? "font-[family-name:var(--font-geist-sans)]" : ""}`}
        >
          {blog.content}
        </div>
      ) : null}

      {linkedBooks.length > 0 && (
        <section className="space-y-3 rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Linked books in our catalogue</h2>
          <ul className="space-y-2">
            {linkedBooks.map((book) => (
              <li key={book.id}>
                <Link href={`/catalogue/${book.id}`} className="text-primary hover:underline">
                  {book.title}
                  {book.author ? ` — ${book.author}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {blog.external_url && (
        <a
          href={blog.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Read on Prerna blog <ExternalLink className="size-4" />
        </a>
      )}
    </article>
  );
}

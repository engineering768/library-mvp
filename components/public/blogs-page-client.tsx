"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Blog } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ENGLISH_TYPE = "On Author/Book";
const MARATHI_TYPE = "भेटायला";

export function BlogsPageClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data.blogs ?? []);
        setLoading(false);
      });
  }, []);

  const english = blogs.filter((b) => b.type === ENGLISH_TYPE);
  const marathi = blogs.filter((b) => b.type === MARATHI_TYPE);

  function BlogSection({ title, items }: { title: string; items: Blog[] }) {
    if (!items.length) return null;

    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((blog) => (
            <Card key={blog.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {blog.title_en || blog.title_mr || blog.type}
                </CardTitle>
                {blog.linked_author && (
                  <p className="text-sm text-muted-foreground">{blog.linked_author}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {blog.content ? (
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Read article
                  </Link>
                ) : null}
                {blog.external_url ? (
                  <a
                    href={blog.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Read on Prerna blog <ExternalLink className="size-4" />
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blogs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The library's public blog — readers can browse articles, book recommendations, and updates posted by the library team.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : blogs.length ? (
        <>
          <BlogSection title="On Author / Book (English)" items={english} />
          <BlogSection title="भेटायला (Marathi)" items={marathi} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No published blogs yet.</p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import type { Blog } from "@/lib/supabase/types";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BlogsPageClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/blogs");
    const data = await res.json();
    setBlogs(data.blogs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  async function togglePublish(id: string) {
    await fetch(`/api/blogs/${id}/publish`, { method: "PATCH" });
    fetchBlogs();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blogs</h1>
          <p className="text-sm text-muted-foreground">Link Prerna blog posts to books and authors</p>
        </div>
        <LinkButton href="/admin/blogs/new">
          <Plus className="size-4" />
          New Blog
        </LinkButton>
      </div>

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Linked Books</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>URL</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      <Link href={`/admin/blogs/${blog.id}/edit`} className="font-medium hover:underline">
                        {blog.title_en || blog.title_mr || blog.slug}
                      </Link>
                    </TableCell>
                    <TableCell>{blog.type}</TableCell>
                    <TableCell>{blog.linked_books?.length ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={blog.published ? "default" : "secondary"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {blog.content ? (
                        <a href={`/blogs/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                          View
                        </a>
                      ) : null}
                      {blog.external_url ? (
                        <a href={blog.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm hover:underline">
                          Link <ExternalLink className="size-3" />
                        </a>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => togglePublish(blog.id)}>
                        {blog.published ? "Unpublish" : "Publish"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {blogs.map((blog) => (
          <div key={blog.id} className="rounded-lg border p-4 space-y-2">
            <Link href={`/admin/blogs/${blog.id}/edit`} className="font-medium hover:underline">
              {blog.title_en || blog.title_mr || blog.slug}
            </Link>
            <p className="text-sm text-muted-foreground">{blog.type}</p>
            <div className="flex gap-2">
              <Badge variant={blog.published ? "default" : "secondary"}>
                {blog.published ? "Published" : "Draft"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => togglePublish(blog.id)}>
                Toggle
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBlog } from "@/lib/services/blogs";
import { BlogForm } from "@/components/admin/blog-form";
import { LinkButton } from "@/components/ui/link-button";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let blog;
  try {
    blog = await getBlog(supabase, id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href="/admin/blogs" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Blogs
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Blog</h1>
      </div>
      <BlogForm blog={blog} mode="edit" />
    </div>
  );
}

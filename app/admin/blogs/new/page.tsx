import { ArrowLeft } from "lucide-react";
import { BlogForm } from "@/components/admin/blog-form";
import { LinkButton } from "@/components/ui/link-button";

export default function NewBlogPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href="/admin/blogs" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Blogs
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Blog</h1>
        <p className="text-sm text-muted-foreground mt-1">Draft a new blog post for the public website — write and preview here, then publish it when it's ready to go live.</p>
      </div>
      <BlogForm mode="create" />
    </div>
  );
}

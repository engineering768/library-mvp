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
      </div>
      <BlogForm mode="create" />
    </div>
  );
}

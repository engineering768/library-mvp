import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createBlog, listBlogs } from "@/lib/services/blogs";
import { blogFormSchema } from "@/lib/validations/phase3";

export async function GET() {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const blogs = await listBlogs(supabase!);
    return NextResponse.json({ success: true, blogs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch blogs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = blogFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const blog = await createBlog(supabase!, parsed.data);
    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create blog";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

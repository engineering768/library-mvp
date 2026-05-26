import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { deleteBlog, getBlog, updateBlog } from "@/lib/services/blogs";
import { blogFormSchema } from "@/lib/validations/phase3";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const blog = await getBlog(supabase!, id);
    return NextResponse.json({ success: true, blog });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Blog not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = blogFormSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const blog = await updateBlog(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, blog });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update blog";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    await deleteBlog(supabase!, id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete blog";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

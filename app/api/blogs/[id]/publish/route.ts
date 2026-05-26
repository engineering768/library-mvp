import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { toggleBlogPublish } from "@/lib/services/blogs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const blog = await toggleBlogPublish(supabase!, id);
    return NextResponse.json({ success: true, blog });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to toggle publish";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

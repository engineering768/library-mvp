import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getBlogBySlug } from "@/lib/services/blogs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const supabase = createPublicClient();
    const blog = await getBlogBySlug(supabase, slug);
    return NextResponse.json({ success: true, blog });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Blog not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

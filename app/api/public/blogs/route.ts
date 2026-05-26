import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { listBlogs } from "@/lib/services/blogs";

export async function GET() {
  try {
    const supabase = createPublicClient();
    const blogs = await listBlogs(supabase, true);
    return NextResponse.json({ success: true, blogs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch blogs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

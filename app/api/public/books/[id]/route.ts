import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicBook } from "@/lib/services/public-books";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const supabase = createAdminClient();
    const result = await getPublicBook(supabase, id);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Book not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

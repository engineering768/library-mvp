import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listPublicBooks } from "@/lib/services/public-books";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createAdminClient();

    const result = await listPublicBooks(supabase, {
      language: searchParams.get("language") ?? undefined,
      age_group: searchParams.get("age_group") ?? undefined,
      genre: searchParams.get("genre") ?? undefined,
      available_only: searchParams.get("available_only") === "true",
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 24),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch books";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

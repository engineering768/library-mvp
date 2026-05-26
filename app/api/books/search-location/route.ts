import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { searchBookLocation } from "@/lib/services/sessions";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const q = new URL(request.url).searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const results = await searchBookLocation(supabase!, q);
    return NextResponse.json({ success: true, results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getBookLocation } from "@/lib/services/sessions";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const location = await getBookLocation(supabase!, id);
    return NextResponse.json({ success: true, location });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Book not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

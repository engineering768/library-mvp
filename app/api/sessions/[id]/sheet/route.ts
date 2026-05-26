import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { buildSessionSheetHtml, getSession } from "@/lib/services/sessions";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const session = await getSession(supabase!, id);
    const html = buildSessionSheetHtml(session);

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Session not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

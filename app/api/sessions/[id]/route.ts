import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  deleteSession,
  getSession,
  updateSession,
} from "@/lib/services/sessions";
import { sessionUpdateSchema } from "@/lib/validations/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const session = await getSession(supabase!, id);
    return NextResponse.json({ success: true, session });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Session not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = sessionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const session = await updateSession(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, session });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    await deleteSession(supabase!, id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { returnSessionBook } from "@/lib/services/sessions";
import { returnBookSchema } from "@/lib/validations/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = returnBookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const session = await returnSessionBook(supabase!, id, parsed.data.book_id, {
      condition_note: parsed.data.condition_note,
      damaged: parsed.data.damaged,
    });

    return NextResponse.json({ success: true, session });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to mark book returned";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

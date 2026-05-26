import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { returnLending } from "@/lib/services/lending";
import { lendingReturnSchema } from "@/lib/validations/lending";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = lendingReturnSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const transaction = await returnLending(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, transaction });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to return book";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createLending, listLending } from "@/lib/services/lending";
import { lendingCreateSchema } from "@/lib/validations/lending";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);

  try {
    const lending = await listLending(supabase!, {
      status: searchParams.get("status") ?? undefined,
      member_id: searchParams.get("member_id") ?? undefined,
    });

    return NextResponse.json({ success: true, lending });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch lending";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = lendingCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const transaction = await createLending(supabase!, parsed.data);
    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create lending";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

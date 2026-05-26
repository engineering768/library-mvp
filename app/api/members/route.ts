import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createMember, listMembers } from "@/lib/services/members";
import { memberFormSchema } from "@/lib/validations/member";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);

  try {
    const members = await listMembers(supabase!, {
      status: searchParams.get("status") ?? undefined,
      membership_type: searchParams.get("membership_type") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    return NextResponse.json({ success: true, members });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch members";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = memberFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const member = await createMember(supabase!, parsed.data);
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create member";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

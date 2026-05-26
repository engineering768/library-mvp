import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  getMemberProfile,
  suspendMember,
  updateMember,
} from "@/lib/services/members";
import { memberUpdateSchema } from "@/lib/validations/member";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const profile = await getMemberProfile(supabase!, id);
    return NextResponse.json({ success: true, profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Member not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = memberUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const member = await updateMember(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, member });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update member";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const member = await suspendMember(supabase!, id);
    return NextResponse.json({ success: true, member });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to suspend member";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

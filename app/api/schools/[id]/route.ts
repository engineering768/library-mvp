import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  deactivateSchool,
  getSchoolWithSessions,
  updateSchool,
} from "@/lib/services/schools";
import { schoolUpdateSchema } from "@/lib/validations/school";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const data = await getSchoolWithSessions(supabase!, id);
    return NextResponse.json({ success: true, ...data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "School not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = schoolUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const school = await updateSchool(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, school });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update school";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const school = await deactivateSchool(supabase!, id);
    return NextResponse.json({ success: true, school });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to deactivate school";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

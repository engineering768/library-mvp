import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createSchool, listSchools } from "@/lib/services/schools";
import { schoolFormSchema } from "@/lib/validations/school";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const activeParam = searchParams.get("active");

  try {
    const schools = await listSchools(supabase!, {
      type: searchParams.get("type") ?? undefined,
      active: activeParam === null ? undefined : activeParam === "true",
      search: searchParams.get("search") ?? undefined,
    });

    return NextResponse.json({ success: true, schools });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch schools";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schoolFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const school = await createSchool(supabase!, parsed.data);
    return NextResponse.json({ success: true, school }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create school";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

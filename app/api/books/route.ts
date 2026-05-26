import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  createBook,
  listBooks,
  bulkMarkLabels,
} from "@/lib/services/books";
import { bookFormSchema } from "@/lib/validations/book";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const bulkAction = searchParams.get("bulk");

  if (bulkAction === "mark-labels") {
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
    const applied = searchParams.get("applied") === "true";
    try {
      await bulkMarkLabels(supabase!, ids, applied);
      return NextResponse.json({ success: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Bulk update failed";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }

  try {
    const result = await listBooks(supabase!, {
      status: searchParams.get("status") ?? undefined,
      language: searchParams.get("language") ?? undefined,
      age_group: searchParams.get("age_group") ?? undefined,
      genre: searchParams.get("genre") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 50),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch books";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = bookFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const book = await createBook(supabase!, parsed.data);
    return NextResponse.json({ success: true, book }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create book";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { ids, physical_label } = body as {
      ids: string[];
      physical_label: boolean;
    };

    if (!ids?.length) {
      return NextResponse.json(
        { success: false, error: "No books selected" },
        { status: 400 }
      );
    }

    await bulkMarkLabels(supabase!, ids, physical_label);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bulk update failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

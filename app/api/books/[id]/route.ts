import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getBook, retireBook, updateBook } from "@/lib/services/books";
import { bookUpdateSchema } from "@/lib/validations/book";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const book = await getBook(supabase!, id);
    return NextResponse.json({ success: true, book });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Book not found";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = bookUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const book = await updateBook(supabase!, id, parsed.data);
    return NextResponse.json({ success: true, book });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update book";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const book = await retireBook(supabase!, id);
    return NextResponse.json({ success: true, book });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to retire book";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

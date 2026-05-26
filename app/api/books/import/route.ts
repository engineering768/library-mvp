import { NextResponse } from "next/server";
import Papa from "papaparse";
import { requireAuth } from "@/lib/api-auth";
import { createBook, listBooks } from "@/lib/services/books";
import {
  bookUploadRowToPayload,
  isEmptyUploadRow,
  mapBookUploadRow,
} from "@/lib/csv/book-upload-map";
import { bookFormSchema } from "@/lib/validations/book";

export async function POST(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "CSV file is required" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.errors[0]?.message ?? "Failed to parse CSV",
        },
        { status: 400 }
      );
    }

    const existing = await listBooks(supabase!, { limit: 10000 });
    const existingKeys = new Set(
      existing.books.map((b) =>
        `${b.title.toLowerCase()}|${(b.author ?? "").toLowerCase()}`
      )
    );

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [index, row] of parsed.data.entries()) {
      if (isEmptyUploadRow(row)) {
        skipped++;
        continue;
      }

      const mapped = mapBookUploadRow(row);
      const payload = bookUploadRowToPayload(mapped);

      if (!payload.title) {
        skipped++;
        errors.push(`Row ${index + 2}: missing title`);
        continue;
      }

      const dedupeKey = `${payload.title.toLowerCase()}|${(payload.author ?? "").toLowerCase()}`;
      if (existingKeys.has(dedupeKey)) {
        skipped++;
        continue;
      }

      const validated = bookFormSchema.safeParse(payload);

      if (!validated.success) {
        skipped++;
        errors.push(
          `Row ${index + 2}: ${validated.error.issues[0]?.message ?? "Invalid data"}`
        );
        continue;
      }

      try {
        await createBook(supabase!, validated.data);
        existingKeys.add(dedupeKey);
        imported++;
      } catch (e) {
        skipped++;
        errors.push(
          `Row ${index + 2}: ${e instanceof Error ? e.message : "Import failed"}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

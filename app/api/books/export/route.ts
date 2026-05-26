import { NextResponse } from "next/server";
import Papa from "papaparse";
import { requireAuth } from "@/lib/api-auth";
import { listBooks } from "@/lib/services/books";

export async function GET(request: Request) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean);

  try {
    const result = await listBooks(supabase!, { limit: 10000 });
    let books = result.books;

    if (ids?.length) {
      books = books.filter((b) => ids.includes(b.id));
    }

    const csv = Papa.unparse(
      books.map((b) => ({
        "Sr No": b.catalog_sr_no,
        "Title of the book": b.title,
        Author: b.author,
        Illustrator: b.illustrator,
        Publication: b.publisher,
        "Year of Publication": b.year,
        Language: b.language,
        "Age group": b.age_group,
        "Genre 1": b.genre_1,
        "Genre 2": b.genre_2,
        "Genre 3": b.genre_3,
        "Format of the book": b.format,
        Awards: b.awards,
        SEL: b.sel,
        Theme: b.theme,
        Setting: b.setting,
        Recommendation: b.recommendation,
        Blog: b.blog_language ?? b.blog_link_en,
        "Additional Material": b.additional_material,
        Availability: b.availability_notes,
        "Readers' Review": b.readers_review,
        "Parent's review": b.parents_review,
        bbid: b.bbid,
        status: b.status,
        stock: b.stock,
      }))
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bookberry-books-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

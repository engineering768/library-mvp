import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getBook } from "@/lib/services/books";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    const book = await getBook(supabase!, id);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Label — ${book.bbid}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; padding: 8mm; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
    .label {
      border: 1px solid #333;
      padding: 6mm;
      height: 60mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      page-break-inside: avoid;
    }
    .brand { font-size: 10pt; font-weight: bold; letter-spacing: 1px; margin-bottom: 4mm; }
    .bbid { font-size: 22pt; font-weight: bold; margin-bottom: 3mm; }
    .title { font-size: 11pt; font-weight: 600; line-height: 1.3; }
    .author { font-size: 9pt; color: #444; margin-top: 2mm; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <p class="no-print" style="margin-bottom: 8mm;">Print this page — 4 labels per sheet (duplicate for multiple stickers).</p>
  <div class="grid">
    ${Array.from({ length: 4 })
      .map(
        () => `
    <div class="label">
      <div class="brand">📚 BOOKBERRY</div>
      <div class="bbid">${book.bbid}</div>
      <div class="title">${escapeHtml(book.title)}</div>
      ${book.author ? `<div class="author">${escapeHtml(book.author)}</div>` : ""}
    </div>`
      )
      .join("")}
  </div>
  <script class="no-print">window.onload = () => window.print();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Label generation failed";
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

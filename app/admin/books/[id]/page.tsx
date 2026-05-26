import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/services/books";
import { StatusBadge } from "@/components/admin/status-badge";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let book;
  try {
    book = await getBook(supabase, id);
  } catch {
    notFound();
  }

  const fields = [
    ["Author", book.author],
    ["Illustrator", book.illustrator],
    ["Publisher", book.publisher],
    ["Year", book.year],
    ["Language", book.language],
    ["Age Group", book.age_group],
    ["Format", book.format],
    ["Condition", book.condition],
    ["Genre 1", book.genre_1],
    ["Genre 2", book.genre_2],
    ["Genre 3", book.genre_3],
    ["Theme", book.theme],
    ["SEL", book.sel],
    ["Setting", book.setting],
    ["Recommendation", book.recommendation],
    ["Awards", book.awards],
    ["Blog Language", book.blog_language],
    ["Additional Material", book.additional_material],
    ["Availability Notes", book.availability_notes],
    ["ISBN", book.isbn],
    ["Stock", book.stock],
    ["Total Copies", book.total_copies],
    ["Rental Validity", `${book.rental_validity} days`],
    ["Physical Label", book.physical_label ? "Applied" : "Not applied"],
    ["Catalog #", book.catalog_sr_no],
  ];

  const reviewFields = [
    ["Readers' Review", book.readers_review],
    ["Parent's Review", book.parents_review],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <LinkButton href="/admin/books" variant="ghost" className="-ml-2">
          <ArrowLeft className="size-4" />
          Back
        </LinkButton>
        <div className="ml-auto flex flex-wrap gap-2">
          <LinkButton href={`/admin/books/${book.id}/label`} variant="outline" target="_blank">
            <Printer className="size-4" />
            Print Label
          </LinkButton>
          <LinkButton href={`/admin/books/${book.id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </LinkButton>
        </div>
      </div>

      <div>
        <p className="font-mono text-sm text-muted-foreground">{book.bbid}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{book.title}</h1>
        <div className="mt-2">
          <StatusBadge status={book.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium">{value ?? "—"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {(book.readers_review || book.parents_review) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reviews</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {reviewFields.map(([label, value]) => (
              <div key={label} className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(book.blog_link_en || book.blog_link_mr || book.blog_language || book.activity_notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Links & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {book.blog_language && (
              <p>
                <span className="text-muted-foreground">Blog: </span>
                {book.blog_language}
              </p>
            )}
            {book.blog_link_en && (
              <p>
                <span className="text-muted-foreground">Blog (EN): </span>
                <a href={book.blog_link_en} className="text-primary underline" target="_blank" rel="noreferrer">
                  {book.blog_link_en}
                </a>
              </p>
            )}
            {book.blog_link_mr && (
              <p>
                <span className="text-muted-foreground">Blog (MR): </span>
                <a href={book.blog_link_mr} className="text-primary underline" target="_blank" rel="noreferrer">
                  {book.blog_link_mr}
                </a>
              </p>
            )}
            {book.activity_notes && <p>{book.activity_notes}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

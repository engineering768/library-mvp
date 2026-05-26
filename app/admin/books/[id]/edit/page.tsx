import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/services/books";
import { BookForm } from "@/components/admin/book-form";
import { LinkButton } from "@/components/ui/link-button";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBookPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let book;
  try {
    book = await getBook(supabase, id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href={`/admin/books/${book.id}`} variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Book
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Book</h1>
        <p className="text-sm text-muted-foreground">{book.title}</p>
      </div>
      <BookForm book={book} mode="edit" />
    </div>
  );
}

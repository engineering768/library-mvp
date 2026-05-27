import { ArrowLeft } from "lucide-react";
import { BookForm } from "@/components/admin/book-form";
import { LinkButton } from "@/components/ui/link-button";

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <LinkButton href="/admin/books" variant="ghost" className="-ml-2">
        <ArrowLeft className="size-4" />
        Back to Books
      </LinkButton>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Book</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the book's details to add it to the catalogue — a unique BBID label is generated automatically once saved.
        </p>
      </div>
      <BookForm mode="create" />
    </div>
  );
}

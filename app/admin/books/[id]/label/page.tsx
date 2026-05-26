import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/services/books";

type PageProps = { params: Promise<{ id: string }> };

export default async function BookLabelPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    await getBook(supabase, id);
  } catch {
    redirect("/admin/books");
  }

  redirect(`/api/books/${id}/label`);
}

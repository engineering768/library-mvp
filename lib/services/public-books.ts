import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book } from "@/lib/supabase/types";

export type PublicBookListParams = {
  language?: string;
  age_group?: string;
  genre?: string;
  available_only?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export async function listPublicBooks(
  supabase: SupabaseClient,
  params: PublicBookListParams = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 24;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("books")
    .select(
      "id, bbid, title, author, language, age_group, genre_1, format, status, stock",
      { count: "exact" }
    )
    .neq("status", "Retired")
    .order("title", { ascending: true });

  if (params.available_only) {
    query = query.eq("status", "Available").gt("stock", 0);
  }
  if (params.language) query = query.eq("language", params.language);
  if (params.age_group) query = query.eq("age_group", params.age_group);
  if (params.genre) {
    query = query.or(
      `genre_1.eq.${params.genre},genre_2.eq.${params.genre},genre_3.eq.${params.genre}`
    );
  }
  if (params.search) {
    const term = `%${params.search}%`;
    query = query.or(`title.ilike.${term},author.ilike.${term},bbid.ilike.${term}`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { books: data ?? [], total: count ?? 0, page, limit };
}

export async function getPublicBook(supabase: SupabaseClient, id: string) {
  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .neq("status", "Retired")
    .single();

  if (error) throw error;

  const { count: waitlist_count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .eq("book_id", id)
    .eq("notified", false);

  return {
    book: book as Book,
    waitlist_count: waitlist_count ?? 0,
    is_available: book.status === "Available" && book.stock > 0,
  };
}

export async function addPublicWaitlist(
  supabase: SupabaseClient,
  payload: { book_id: string; name: string; contact: string }
) {
  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      book_id: payload.book_id,
      name: payload.name,
      contact: payload.contact,
      notify_method: "whatsapp",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

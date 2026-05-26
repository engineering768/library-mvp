import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book, DashboardStats } from "@/lib/supabase/types";
import { generateBBID } from "@/lib/utils/bbid";
import type { BookFormValues } from "@/lib/validations/book";

export type BookListParams = {
  status?: string;
  language?: string;
  age_group?: string;
  genre?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function emptyToNull(value: string | null | undefined) {
  if (value === "" || value === undefined) return null;
  return value;
}

export function normalizeBookPayload(data: BookFormValues) {
  return {
    ...data,
    author: emptyToNull(data.author ?? null),
    illustrator: emptyToNull(data.illustrator ?? null),
    publisher: emptyToNull(data.publisher ?? null),
    language: emptyToNull(data.language ?? null),
    age_group: emptyToNull(data.age_group ?? null),
    genre_1: emptyToNull(data.genre_1 ?? null),
    genre_2: emptyToNull(data.genre_2 ?? null),
    genre_3: emptyToNull(data.genre_3 ?? null),
    theme: emptyToNull(data.theme ?? null),
    awards: emptyToNull(data.awards ?? null),
    isbn: emptyToNull(data.isbn ?? null),
    blog_link_en: emptyToNull(data.blog_link_en ?? null),
    blog_link_mr: emptyToNull(data.blog_link_mr ?? null),
    activity_notes: emptyToNull(data.activity_notes ?? null),
    sel: emptyToNull(data.sel ?? null),
    setting: emptyToNull(data.setting ?? null),
    recommendation: emptyToNull(data.recommendation ?? null),
    blog_language: emptyToNull(data.blog_language ?? null),
    additional_material: emptyToNull(data.additional_material ?? null),
    availability_notes: emptyToNull(data.availability_notes ?? null),
    readers_review: emptyToNull(data.readers_review ?? null),
    parents_review: emptyToNull(data.parents_review ?? null),
    catalog_sr_no: data.catalog_sr_no ?? null,
    year: data.year ?? null,
  };
}

export async function listBooks(
  supabase: SupabaseClient,
  params: BookListParams = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("books")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.language) query = query.eq("language", params.language);
  if (params.age_group) query = query.eq("age_group", params.age_group);
  if (params.genre) {
    query = query.or(
      `genre_1.eq.${params.genre},genre_2.eq.${params.genre},genre_3.eq.${params.genre}`
    );
  }
  if (params.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `title.ilike.${term},author.ilike.${term},bbid.ilike.${term}`
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    books: (data ?? []) as Book[],
    total: count ?? 0,
    page,
    limit,
  };
}

export async function getBook(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Book;
}

export async function createBook(
  supabase: SupabaseClient,
  payload: BookFormValues
) {
  const bbid = await generateBBID(supabase);
  const normalized = normalizeBookPayload(payload);

  const { data, error } = await supabase
    .from("books")
    .insert({ ...normalized, bbid })
    .select()
    .single();

  if (error) throw error;
  return data as Book;
}

export async function updateBook(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<BookFormValues>
) {
  const normalized = normalizeBookPayload(payload as BookFormValues);

  const { data, error } = await supabase
    .from("books")
    .update(normalized)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Book;
}

export async function retireBook(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("books")
    .update({ status: "Retired" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Book;
}

export async function getDashboardStats(
  supabase: SupabaseClient
): Promise<DashboardStats> {
  const { data, error } = await supabase.from("books").select("status");

  if (error) throw error;

  const books = data ?? [];
  const total = books.length;
  const available = books.filter((b) => b.status === "Available").length;
  const out = books.filter(
    (b) => b.status === "Out - Session" || b.status === "Out - Member"
  ).length;
  const damaged = books.filter((b) => b.status === "Damaged").length;
  const missing = books.filter((b) => b.status === "Missing").length;

  return {
    total,
    available,
    out,
    damaged,
    lost: missing,
    missing,
    todays_sessions: 0,
    books_out_sessions: books.filter((b) => b.status === "Out - Session").length,
    active_members: 0,
    expired_members_month: 0,
    overdue_count: 0,
    books_out_members: books.filter((b) => b.status === "Out - Member").length,
    revenue_mtd: 0,
    upcoming_events: 0,
    upcoming_event_rsvps: 0,
  };
}

export async function getRecentBooks(supabase: SupabaseClient, limit = 10) {
  const { data, error } = await supabase
    .from("books")
    .select("id, bbid, title, status, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function bulkMarkLabels(
  supabase: SupabaseClient,
  ids: string[],
  applied: boolean
) {
  const { error } = await supabase
    .from("books")
    .update({ physical_label: applied })
    .in("id", ids);

  if (error) throw error;
}

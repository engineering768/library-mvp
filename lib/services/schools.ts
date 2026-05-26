import type { SupabaseClient } from "@supabase/supabase-js";
import type { School } from "@/lib/supabase/types";
import { generateSchoolId } from "@/lib/utils/school-id";
import type { SchoolFormValues } from "@/lib/validations/school";

export type SchoolListParams = {
  type?: string;
  active?: boolean;
  search?: string;
};

function emptyToNull(value: string | null | undefined) {
  if (value === "" || value === undefined) return null;
  return value;
}

export function normalizeSchoolPayload(data: SchoolFormValues) {
  return {
    ...data,
    area: emptyToNull(data.area ?? null),
    ward: emptyToNull(data.ward ?? null),
    contact_person: emptyToNull(data.contact_person ?? null),
    contact_number: emptyToNull(data.contact_number ?? null),
    medium: emptyToNull(data.medium ?? null),
    std_range: emptyToNull(data.std_range ?? null),
    notes: emptyToNull(data.notes ?? null),
  };
}

export async function listSchools(
  supabase: SupabaseClient,
  params: SchoolListParams = {}
) {
  let query = supabase
    .from("schools")
    .select("*")
    .order("name", { ascending: true });

  if (params.type) query = query.eq("type", params.type);
  if (params.active !== undefined) query = query.eq("active", params.active);
  if (params.search) {
    const term = `%${params.search}%`;
    query = query.or(`name.ilike.${term},school_id.ilike.${term},area.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as School[];
}

export async function getSchool(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as School;
}

export async function getSchoolWithSessions(
  supabase: SupabaseClient,
  id: string
) {
  const school = await getSchool(supabase, id);

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(
      `
      id, session_id, date, class_grade, division, status,
      session_books ( id, returned )
    `
    )
    .eq("school_id", id)
    .order("date", { ascending: false });

  if (error) throw error;

  const history = (sessions ?? []).map((s) => {
    const books = (s.session_books as { returned: boolean | null }[]) ?? [];
    return {
      id: s.id,
      session_id: s.session_id,
      date: s.date,
      class_grade: s.class_grade,
      division: s.division,
      status: s.status,
      books_carried: books.length,
      books_returned: books.filter((b) => b.returned === true).length,
      missing: books.filter((b) => b.returned === false).length,
    };
  });

  return { school, sessions: history };
}

export async function createSchool(
  supabase: SupabaseClient,
  payload: SchoolFormValues
) {
  const school_id = await generateSchoolId(supabase, payload.type);
  const normalized = normalizeSchoolPayload(payload);

  const { data, error } = await supabase
    .from("schools")
    .insert({ ...normalized, school_id })
    .select()
    .single();

  if (error) throw error;
  return data as School;
}

export async function updateSchool(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<SchoolFormValues>
) {
  const normalized = normalizeSchoolPayload(payload as SchoolFormValues);

  const { data, error } = await supabase
    .from("schools")
    .update(normalized)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as School;
}

export async function deactivateSchool(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("schools")
    .update({ active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as School;
}

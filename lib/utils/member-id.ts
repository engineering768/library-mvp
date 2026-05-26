import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateMemberId(
  supabase: SupabaseClient
): Promise<string> {
  const year = new Date().getFullYear();

  const { data, error } = await supabase.rpc("increment_member_id_sequence", {
    p_year: year,
  });

  if (error) throw error;

  const seq = String(data).padStart(4, "0");
  return `MEM-${year}-${seq}`;
}

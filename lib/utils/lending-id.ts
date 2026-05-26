import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateLendingId(
  supabase: SupabaseClient
): Promise<string> {
  const year = new Date().getFullYear();

  const { data, error } = await supabase.rpc("increment_lending_id_sequence", {
    p_year: year,
  });

  if (error) throw error;

  const seq = String(data).padStart(5, "0");
  return `LND-${year}-${seq}`;
}

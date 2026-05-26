import type { SupabaseClient } from "@supabase/supabase-js";

function formatDateKey(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function generateSessionId(
  supabase: SupabaseClient,
  date: string | Date
): Promise<string> {
  const dateKey = formatDateKey(date);

  const { data, error } = await supabase.rpc("increment_session_id_sequence", {
    p_date_key: dateKey,
  });

  if (error) throw error;

  const seq = String(data).padStart(3, "0");
  return `SES-${dateKey}-${seq}`;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SchoolType } from "@/lib/supabase/types";

function typePrefix(type: SchoolType) {
  return type === "Municipal" ? "MUN" : "PVT";
}

export async function generateSchoolId(
  supabase: SupabaseClient,
  type: SchoolType
): Promise<string> {
  const prefix = typePrefix(type);

  const { data, error } = await supabase.rpc("increment_school_id_sequence", {
    p_type: prefix,
  });

  if (error) throw error;

  const seq = String(data).padStart(3, "0");
  return `SCH-${prefix}-${seq}`;
}

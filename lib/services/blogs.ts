import type { SupabaseClient } from "@supabase/supabase-js";
import type { Blog } from "@/lib/supabase/types";
import { slugify, uniqueSlug } from "@/lib/utils/slug";
import type { BlogFormValues } from "@/lib/validations/phase3";

export async function listBlogs(supabase: SupabaseClient, publishedOnly = false) {
  let query = supabase.from("blogs").select("*").order("created_at", { ascending: false });
  if (publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Blog[];
}

export async function getBlogBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) throw error;
  return data as Blog;
}

export async function getBlog(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Blog;
}

async function resolveSlug(supabase: SupabaseClient, values: BlogFormValues, excludeId?: string) {
  if (values.slug) return values.slug;
  const base = values.title_en || values.title_mr || values.type;
  let slug = slugify(base);
  let attempt = 0;

  while (true) {
    const candidate = attempt === 0 ? slug : uniqueSlug(base, String(attempt));
    let query = supabase.from("blogs").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    attempt++;
  }
}

export async function createBlog(supabase: SupabaseClient, values: BlogFormValues) {
  const slug = await resolveSlug(supabase, values);

  const { data, error } = await supabase
    .from("blogs")
    .insert({
      ...values,
      slug,
      external_url: values.external_url || null,
      content: values.content ?? null,
      linked_books: values.linked_books ?? [],
      linked_author: values.linked_author ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Blog;
}

export async function updateBlog(
  supabase: SupabaseClient,
  id: string,
  values: Partial<BlogFormValues>
) {
  const payload = { ...values };
  if (values.title_en || values.title_mr) {
    payload.slug = await resolveSlug(supabase, values as BlogFormValues, id);
  }

  const { data, error } = await supabase
    .from("blogs")
    .update({
      ...payload,
      linked_author: values.linked_author ?? undefined,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Blog;
}

export async function deleteBlog(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("blogs").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleBlogPublish(supabase: SupabaseClient, id: string) {
  const blog = await getBlog(supabase, id);
  const { data, error } = await supabase
    .from("blogs")
    .update({ published: !blog.published })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Blog;
}

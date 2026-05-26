/**
 * Seed the two Prerna sample blogs from content/blogs/*.txt
 * Usage: node scripts/seed-sample-blogs.mjs
 * Requires: .env with Supabase URL + service role key
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const SAMPLES = [
  {
    slug: "brendan-wenzel-wizard-of-perspectives",
    title_en: "Brendan Wenzel: The Wizard of Perspectives",
    title_mr: null,
    type: "On Author/Book",
    linked_author: "Brendan Wenzel",
    contentFile: "brendan-wenzel-wizard-of-perspectives.txt",
    linkedBookTitles: [],
  },
  {
    slug: "bhetayla-havit-ashi-pustake",
    title_en: null,
    title_mr: "भेटायला हवीत अशी पुस्तके",
    type: "भेटायला",
    linked_author: null,
    contentFile: "bhetayla-havit-ashi-pustake.txt",
    linkedBookTitles: ["Flotsam", "A Long Road on a Short Day"],
  },
];

async function bookIdsForTitles(titles) {
  if (!titles.length) return [];
  const { data } = await supabase.from("books").select("id, title").in("title", titles);
  return (data ?? []).map((b) => b.id);
}

async function main() {
  for (const sample of SAMPLES) {
    const content = fs.readFileSync(
      path.join(root, "content", "blogs", sample.contentFile),
      "utf8"
    );
    const linked_books = await bookIdsForTitles(sample.linkedBookTitles);

    const row = {
      slug: sample.slug,
      title_en: sample.title_en,
      title_mr: sample.title_mr,
      type: sample.type,
      external_url: null,
      content,
      linked_author: sample.linked_author,
      linked_books,
      published: true,
    };

    const { data: existing } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", sample.slug)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("blogs").update(row).eq("id", existing.id);
      if (error) throw error;
      console.log(`Updated blog: ${sample.slug}`);
    } else {
      const { error } = await supabase.from("blogs").insert(row);
      if (error) throw error;
      console.log(`Inserted blog: ${sample.slug}`);
    }
  }

  console.log("Done — visit /blogs to preview");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Run migration 004 in Supabase SQL Editor first, then:
 *   node scripts/seed-book-upload.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      })
  );
}

function clean(value) {
  if (!value?.trim()) return null;
  const t = value.trim();
  if (["na", "n/a", "-"].includes(t.toLowerCase())) return null;
  return t;
}

function normalizeFormat(value) {
  if (!value) return "Paperback";
  const lower = value.toLowerCase();
  if (lower.includes("hardcover")) return "Hardcover";
  if (lower.includes("wordless")) return "Wordless";
  if (lower.includes("board")) return "Board Book";
  return "Paperback";
}

async function generateBBID(supabase, year) {
  const { data, error } = await supabase.rpc("increment_bbid_sequence", {
    p_year: year,
  });
  if (error) throw error;
  return `BB-${year}-${String(data).padStart(4, "0")}`;
}

function mapRow(row) {
  const get = (...keys) => {
    for (const k of Object.keys(row)) {
      if (keys.includes(k.trim().toLowerCase())) return row[k];
    }
    return "";
  };

  const title = clean(get("title of the book", "title"));
  if (!title) return null;

  const blogRaw = clean(get("blog"));
  const blog_language =
    blogRaw && !/^https?:\/\//i.test(blogRaw) ? blogRaw : null;
  const blog_link_en =
    blogRaw && /^https?:\/\//i.test(blogRaw) ? blogRaw : null;

  return {
    catalog_sr_no: Number(get("sr no")) || null,
    title,
    author: clean(get("author")),
    illustrator: clean(get("illustrator")),
    publisher: clean(get("publication", "publisher")),
    year: Number(get("year of publication", "year")) || null,
    language: clean(get("language")),
    age_group: clean(get("age group", "age_group")),
    genre_1: clean(get("genre 1", "genre_1")),
    genre_2: clean(get("genre 2", "genre_2")),
    genre_3: clean(get("genre 3", "genre_3")),
    format: normalizeFormat(clean(get("format of the book", "format"))),
    awards: clean(get("awards")),
    sel: clean(get("sel")),
    theme: clean(get("theme")),
    setting: clean(get("setting")),
    recommendation: clean(get("recommendation")),
    blog_language,
    blog_link_en,
    additional_material: clean(get("additional material")),
    availability_notes: clean(get("availability")),
    readers_review: clean(get("readers' review", "readers review")),
    parents_review: clean(get("parent's review", "parents review")),
    condition: "Good",
    status: "Available",
    physical_label: false,
    rental_validity: 14,
    stock: 1,
    total_copies: 1,
  };
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const csvPath =
    process.argv[2] ??
    path.join(root, "book_upload.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found:", csvPath);
    process.exit(1);
  }

  const parsed = Papa.parse(fs.readFileSync(csvPath, "utf8"), {
    header: true,
    skipEmptyLines: true,
  });

  const year = new Date().getFullYear();
  let imported = 0;
  let skipped = 0;

  for (const row of parsed.data) {
    const book = mapRow(row);
    if (!book) {
      skipped++;
      continue;
    }

    const { data: existing } = await supabase
      .from("books")
      .select("id")
      .ilike("title", book.title)
      .maybeSingle();

    if (existing) {
      console.log("Skip (exists):", book.title);
      skipped++;
      continue;
    }

    const bbid = await generateBBID(supabase, year);
    const { error } = await supabase.from("books").insert({ ...book, bbid });

    if (error) {
      console.error("Failed:", book.title, error.message);
      if (error.message.includes("column")) {
        console.error(
          "\nRun supabase/migrations/004_books_csv_columns.sql in Supabase SQL Editor first.\n"
        );
        process.exit(1);
      }
      skipped++;
      continue;
    }

    console.log("Imported:", bbid, book.title);
    imported++;
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

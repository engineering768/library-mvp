import type { BookFormValues } from "@/lib/validations/book";

/** Maps header names from book_upload.csv (case-insensitive) to book fields */
export const BOOK_UPLOAD_FIELD_MAP: Record<string, keyof BookUploadRow> = {
  "sr no": "catalog_sr_no",
  "title of the book": "title",
  title: "title",
  author: "author",
  illustrator: "illustrator",
  publication: "publisher",
  publisher: "publisher",
  "year of publication": "year",
  year: "year",
  language: "language",
  "age group": "age_group",
  age_group: "age_group",
  "genre 1": "genre_1",
  genre_1: "genre_1",
  "genre 2": "genre_2",
  genre_2: "genre_2",
  "genre 3": "genre_3",
  genre_3: "genre_3",
  "format of the book": "format",
  format: "format",
  awards: "awards",
  sel: "sel",
  theme: "theme",
  setting: "setting",
  recommendation: "recommendation",
  blog: "blog",
  "additional material": "additional_material",
  availability: "availability_notes",
  "readers' review": "readers_review",
  "readers review": "readers_review",
  "parent's review": "parents_review",
  "parents review": "parents_review",
  isbn: "isbn",
  condition: "condition",
  stock: "stock",
  total_copies: "total_copies",
  rental_validity: "rental_validity",
};

export type BookUploadRow = {
  catalog_sr_no?: string;
  title?: string;
  author?: string;
  illustrator?: string;
  publisher?: string;
  year?: string;
  language?: string;
  age_group?: string;
  genre_1?: string;
  genre_2?: string;
  genre_3?: string;
  format?: string;
  awards?: string;
  sel?: string;
  theme?: string;
  setting?: string;
  recommendation?: string;
  blog?: string;
  additional_material?: string;
  availability_notes?: string;
  readers_review?: string;
  parents_review?: string;
  isbn?: string;
  condition?: string;
  stock?: string;
  total_copies?: string;
  rental_validity?: string;
};

const EMPTY_VALUES = new Set(["", "na", "n/a", "-", "—"]);

function cleanValue(value: string | undefined | null) {
  if (value == null) return null;
  const trimmed = value.trim();
  if (EMPTY_VALUES.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

function normalizeFormat(value: string | null) {
  if (!value) return "Paperback";
  const lower = value.toLowerCase();
  if (lower.includes("hardcover") || lower.includes("hard cover")) return "Hardcover";
  if (lower.includes("wordless")) return "Wordless";
  if (lower.includes("board")) return "Board Book";
  return "Paperback";
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function mapBookUploadRow(row: Record<string, string>) {
  const mapped: BookUploadRow = {};

  for (const [key, value] of Object.entries(row)) {
    const field = BOOK_UPLOAD_FIELD_MAP[key.trim().toLowerCase()];
    if (field && value?.trim()) {
      mapped[field] = value.trim();
    }
  }

  return mapped;
}

export function bookUploadRowToPayload(row: BookUploadRow): Partial<BookFormValues> & {
  catalog_sr_no?: number | null;
  sel?: string | null;
  setting?: string | null;
  recommendation?: string | null;
  blog_language?: string | null;
  additional_material?: string | null;
  availability_notes?: string | null;
  readers_review?: string | null;
  parents_review?: string | null;
} {
  const blogRaw = cleanValue(row.blog);
  let blog_link_en: string | null = null;
  let blog_language: string | null = null;

  if (blogRaw) {
    if (isUrl(blogRaw)) {
      blog_link_en = blogRaw;
    } else {
      blog_language = blogRaw;
    }
  }

  return {
    title: cleanValue(row.title) ?? "",
    author: cleanValue(row.author),
    illustrator: cleanValue(row.illustrator),
    publisher: cleanValue(row.publisher),
    year: row.year ? Number(row.year) : null,
    language: cleanValue(row.language),
    age_group: cleanValue(row.age_group),
    genre_1: cleanValue(row.genre_1),
    genre_2: cleanValue(row.genre_2),
    genre_3: cleanValue(row.genre_3),
    theme: cleanValue(row.theme),
    awards: cleanValue(row.awards),
    format: normalizeFormat(cleanValue(row.format)) as BookFormValues["format"],
    isbn: cleanValue(row.isbn),
    condition: (cleanValue(row.condition) as BookFormValues["condition"]) ?? "Good",
    status: "Available",
    physical_label: false,
    blog_link_en,
    blog_link_mr: null,
    blog_language,
    activity_notes: null,
    rental_validity: row.rental_validity ? Number(row.rental_validity) : 14,
    stock: row.stock ? Number(row.stock) : 1,
    total_copies: row.total_copies ? Number(row.total_copies) : row.stock ? Number(row.stock) : 1,
    catalog_sr_no: row.catalog_sr_no ? Number(row.catalog_sr_no) : null,
    sel: cleanValue(row.sel),
    setting: cleanValue(row.setting),
    recommendation: cleanValue(row.recommendation),
    additional_material: cleanValue(row.additional_material),
    availability_notes: cleanValue(row.availability_notes),
    readers_review: cleanValue(row.readers_review),
    parents_review: cleanValue(row.parents_review),
  };
}

export function isEmptyUploadRow(row: Record<string, string>) {
  const mapped = mapBookUploadRow(row);
  return !mapped.title?.trim();
}

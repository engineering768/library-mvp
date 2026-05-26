import { z } from "zod";

const bookCondition = z.enum(["Good", "Worn", "Damaged"]);
const bookStatus = z.enum([
  "Available",
  "Out - Session",
  "Out - Member",
  "Missing",
  "Damaged",
  "Retired",
]);
const bookFormat = z.enum(["Paperback", "Hardcover", "Wordless", "Board Book"]);

export const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional().nullable(),
  illustrator: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1000).max(2100).optional().nullable(),
  language: z.string().optional().nullable(),
  age_group: z.string().optional().nullable(),
  genre_1: z.string().optional().nullable(),
  genre_2: z.string().optional().nullable(),
  genre_3: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  awards: z.string().optional().nullable(),
  format: bookFormat.default("Paperback"),
  isbn: z.string().optional().nullable(),
  condition: bookCondition.default("Good"),
  status: bookStatus.default("Available"),
  physical_label: z.boolean().default(false),
  blog_link_en: z.string().url().optional().nullable().or(z.literal("")),
  blog_link_mr: z.string().url().optional().nullable().or(z.literal("")),
  activity_notes: z.string().optional().nullable(),
  rental_validity: z.coerce.number().int().min(1).default(14),
  stock: z.coerce.number().int().min(0).default(1),
  total_copies: z.coerce.number().int().min(1).default(1),
  catalog_sr_no: z.coerce.number().int().optional().nullable(),
  sel: z.string().optional().nullable(),
  setting: z.string().optional().nullable(),
  recommendation: z.string().optional().nullable(),
  blog_language: z.string().optional().nullable(),
  additional_material: z.string().optional().nullable(),
  availability_notes: z.string().optional().nullable(),
  readers_review: z.string().optional().nullable(),
  parents_review: z.string().optional().nullable(),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

export const bookUpdateSchema = bookFormSchema.partial().extend({
  title: z.string().min(1).optional(),
});

import { z } from "zod";

export const blogFormSchema = z.object({
  title_en: z.string().optional().nullable(),
  title_mr: z.string().optional().nullable(),
  type: z.string().min(1, "Type is required"),
  external_url: z.string().url("Valid URL required").optional().nullable().or(z.literal("")),
  content: z.string().optional().nullable(),
  linked_books: z.array(z.string().uuid()).default([]),
  linked_author: z.string().optional().nullable(),
  published: z.boolean().default(false),
  slug: z.string().optional(),
}).refine(
  (data) => Boolean(data.external_url || data.content),
  { message: "External URL or content is required", path: ["external_url"] }
);

export type BlogFormValues = z.infer<typeof blogFormSchema>;

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional().nullable(),
  max_capacity: z.coerce.number().int().min(1).optional().nullable(),
  registration_open: z.boolean().default(true),
  status: z.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"]).default("Upcoming"),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const rsvpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
});

export const planFormSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["Monthly", "Quarterly", "Annual", "Free"]),
  price: z.coerce.number().min(0),
  validity_days: z.coerce.number().int().min(1),
  max_books_quota: z.coerce.number().int().min(1).default(2),
  is_free: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

export const publicWaitlistSchema = z.object({
  book_id: z.string().uuid(),
  name: z.string().min(1),
  contact: z.string().min(1),
});

export const paymentOrderSchema = z.object({
  plan_id: z.string().uuid(),
  member_id: z.string().uuid().optional().nullable(),
});

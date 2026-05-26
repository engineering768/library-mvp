import { z } from "zod";

export const sessionFormSchema = z.object({
  school_id: z.string().uuid("Select a school"),
  date: z.string().min(1, "Date is required"),
  class_grade: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  approx_student_count: z.coerce.number().int().min(0).optional().nullable(),
  conducted_by: z.string().default("Prema"),
  notes: z.string().optional().nullable(),
  book_ids: z.array(z.string().uuid()).min(1, "Select at least one book"),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export const sessionUpdateSchema = sessionFormSchema
  .omit({ book_ids: true })
  .partial()
  .extend({
    school_id: z.string().uuid().optional(),
    date: z.string().optional(),
  });

export const returnBookSchema = z.object({
  book_id: z.string().uuid(),
  condition_note: z.string().optional().nullable(),
  damaged: z.boolean().optional(),
});

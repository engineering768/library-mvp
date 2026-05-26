import { z } from "zod";

export const lendingCreateSchema = z.object({
  member_id: z.string().uuid(),
  book_id: z.string().uuid(),
  condition_on_borrow: z.enum(["Good", "Worn", "Damaged"]).default("Good"),
  borrow_date: z.string().optional(),
});

export const lendingReturnSchema = z.object({
  condition_on_return: z.enum(["Good", "Worn", "Damaged"]),
  damage_note: z.string().optional().nullable(),
});

export const waitlistSchema = z.object({
  book_id: z.string().uuid(),
  member_id: z.string().uuid().optional().nullable(),
  name: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
});

export type LendingCreateValues = z.infer<typeof lendingCreateSchema>;
export type LendingReturnValues = z.infer<typeof lendingReturnSchema>;

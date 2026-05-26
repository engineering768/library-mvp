import { z } from "zod";

export const memberFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(1).max(120).optional().nullable(),
  school_name: z.string().optional().nullable(),
  standard: z.string().optional().nullable(),
  medium: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  parent_name: z.string().optional().nullable(),
  parent_contact: z.string().min(1, "Parent contact is required"),
  address: z.string().optional().nullable(),
  membership_type: z.enum(["Monthly", "Quarterly", "Annual", "Free"]),
  membership_start: z.string().min(1, "Start date is required"),
  membership_end: z.string().min(1, "End date is required"),
  deposit_amount: z.coerce.number().min(0).default(0),
  max_books_quota: z.coerce.number().int().min(1).default(2),
  status: z.enum(["Active", "Expired", "Suspended", "Pending"]).default("Active"),
  notes: z.string().optional().nullable(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

export const memberUpdateSchema = memberFormSchema.partial().extend({
  name: z.string().min(1).optional(),
  parent_contact: z.string().min(1).optional(),
});

import { z } from "zod";

export const schoolFormSchema = z.object({
  name: z.string().min(1, "School name is required"),
  type: z.enum(["Municipal", "Private"]),
  area: z.string().optional().nullable(),
  ward: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  contact_number: z.string().optional().nullable(),
  medium: z.string().optional().nullable(),
  std_range: z.string().optional().nullable(),
  active: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

export type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export const schoolUpdateSchema = schoolFormSchema.partial().extend({
  name: z.string().min(1).optional(),
});

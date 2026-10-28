import { z } from "zod";

export const updateMeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be between 2 and 50 characters")
    .max(50, "Name must be between 2 and 50 characters"),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

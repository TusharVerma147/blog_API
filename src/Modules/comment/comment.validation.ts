import { z } from "zod";

export const createCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Comment text must be between 1 and 500 characters")
    .max(500, "Comment text must be between 1 and 500 characters"),
});

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;

import { z } from "zod";

const tagsSchema = z
  .array(z.string().trim().min(1))
  .max(5, "A post can have at most 5 tags")
  .optional()
  .default([]);

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be between 5 and 120 characters")
    .max(120, "Title must be between 5 and 120 characters"),
  body: z.string().min(20, "Body must be at least 20 characters"),
  tags: tagsSchema,
  status: z.enum(["draft", "published"]).optional().default("draft"),
});

export const updatePostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be between 5 and 120 characters")
      .max(120, "Title must be between 5 and 120 characters")
      .optional(),
    body: z.string().min(20, "Body must be at least 20 characters").optional(),
    tags: z
      .array(z.string().trim().min(1))
      .max(5, "A post can have at most 5 tags")
      .optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  sort: z
    .enum(["newest", "oldest", "mostCommented"])
    .optional()
    .default("newest"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

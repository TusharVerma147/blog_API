import { Router } from "express";
import { postController } from "../Modules/post/post.controller";
import { commentController } from "../Modules/comment/comment.controller";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
} from "../Modules/post/post.validation";
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from "../Modules/comment/comment.validation";
import { validateBody, validateQuery } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  validateQuery(listPostsQuerySchema),
  asyncHandler(postController.list)
);

router.post(
  "/",
  requireAuth,
  validateBody(createPostSchema),
  asyncHandler(postController.create)
);

router.get(
  "/:id/comments",
  validateQuery(listCommentsQuerySchema),
  asyncHandler(commentController.list)
);

router.post(
  "/:id/comments",
  requireAuth,
  validateBody(createCommentSchema),
  asyncHandler(commentController.create)
);

router.get("/:id", asyncHandler(postController.getById));

router.patch(
  "/:id",
  requireAuth,
  validateBody(updatePostSchema),
  asyncHandler(postController.update)
);

router.delete("/:id", requireAuth, asyncHandler(postController.remove));

export default router;

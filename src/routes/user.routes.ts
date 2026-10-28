import { Router } from "express";
import { userController } from "../Modules/user/user.controller";
import { postController } from "../Modules/post/post.controller";
import { updateMeSchema } from "../Modules/user/user.validation";
import { validateBody } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/me", requireAuth, asyncHandler(userController.getMe));

router.patch(
  "/me",
  requireAuth,
  validateBody(updateMeSchema),
  asyncHandler(userController.updateMe)
);

router.get("/me/posts", requireAuth, asyncHandler(postController.listMine));

export default router;

import { Router } from "express";
import { commentController } from "../Modules/comment/comment.controller";
import { requireAuth } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.delete("/:id", requireAuth, asyncHandler(commentController.remove));

export default router;

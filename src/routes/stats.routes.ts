import { Router } from "express";
import { statsController } from "../Modules/stats/stats.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(statsController.getStats));

export default router;

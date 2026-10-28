import { Router } from "express";
import { authController } from "../Modules/auth/auth.controller";
import { signupSchema, loginSchema } from "../Modules/auth/auth.validation";
import { validateBody } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
  "/signup",
  validateBody(signupSchema),
  asyncHandler(authController.signup)
);

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

router.post("/logout", asyncHandler(authController.logout));

export default router;

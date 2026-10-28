import { Request, Response } from "express";
import { authService } from "./auth.service";
import { SignupInput, LoginInput } from "./auth.validation";
import { AUTH } from "../../constants/auth";
import { HTTP_STATUS } from "../../constants/httpStatus";

export class AuthController {
  signup = async (req: Request, res: Response): Promise<void> => {
    const user = await authService.signup(req.body as SignupInput);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: user,
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const userAgent = req.get("user-agent") || "";
    const result = await authService.login(req.body as LoginInput, userAgent);

    res.cookie(AUTH.COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      expires: result.expiresAt,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.user,
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.[AUTH.COOKIE_NAME] as string | undefined;
    await authService.logout(token);
    res.clearCookie(AUTH.COOKIE_NAME);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  };
}

export const authController = new AuthController();

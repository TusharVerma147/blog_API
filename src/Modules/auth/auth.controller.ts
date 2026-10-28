import { Request, Response } from "express";
import { authService } from "./auth.service";
import { SignupInput, LoginInput } from "./auth.validation";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { getTokenFromRequest } from "../../utils/authToken";

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

    // Token is sent to the front-end in the body (auth uses Headers, not cookies)
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        ...result.user,
        token: result.token,
      },
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = getTokenFromRequest(req);
    await authService.logout(token);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  };
}

export const authController = new AuthController();

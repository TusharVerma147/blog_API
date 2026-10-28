import { Request, Response } from "express";
import { userService } from "./user.service";
import { UpdateMeInput } from "./user.validation";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { AppError } from "../../utils/AppError";

export class UserController {
  getMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const { profile, cacheStatus } = await userService.getMe(req.user);

    res.setHeader("X-Cache", cacheStatus);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: profile,
    });
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await userService.updateMe(
      req.user._id,
      req.body as UpdateMeInput
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  };
}

export const userController = new UserController();

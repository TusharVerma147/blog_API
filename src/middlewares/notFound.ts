import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/httpStatus";

export function notFound(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new AppError("Route not found", HTTP_STATUS.NOT_FOUND));
}

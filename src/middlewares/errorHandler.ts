import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/httpStatus";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const message =
    err instanceof AppError ? err.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
}

import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/httpStatus";

function getErrorResponse(err: unknown): { statusCode: number; message: string } {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const firstError = Object.values(err.errors)[0];
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: firstError?.message || "Validation failed",
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: `Invalid ${err.path || "ID"}`,
    };
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    return {
      statusCode: HTTP_STATUS.CONFLICT,
      message: "Duplicate value already exists",
    };
  }

  return {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  };
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { statusCode, message } = getErrorResponse(err);

  // Never send stack traces or raw errors to the client
  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

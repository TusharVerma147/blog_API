import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/httpStatus";

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validation failed";
      next(new AppError(message, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validation failed";
      next(new AppError(message, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // Express 5: req.query is read-only
    req.validatedQuery = result.data;
    next();
  };
}

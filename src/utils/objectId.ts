import { Types } from "mongoose";
import { AppError } from "./AppError";
import { HTTP_STATUS } from "../constants/httpStatus";

export function assertObjectId(id: string, label = "ID"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, HTTP_STATUS.BAD_REQUEST);
  }
  return new Types.ObjectId(id);
}

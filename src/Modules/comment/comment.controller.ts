import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { CreateCommentInput, ListCommentsQuery } from "./comment.validation";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { AppError } from "../../utils/AppError";

export class CommentController {
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const comment = await commentService.create(
      req.params.id as string,
      req.user,
      req.body as CreateCommentInput
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: comment,
    });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await commentService.listByPost(
      req.params.id as string,
      req.validatedQuery as ListCommentsQuery
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    await commentService.remove(req.params.id as string, req.user);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Comment deleted successfully",
    });
  };
}

export const commentController = new CommentController();

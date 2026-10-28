import { Request, Response } from "express";
import { postService } from "./post.service";
import {
  CreatePostInput,
  UpdatePostInput,
  ListPostsQuery,
} from "./post.validation";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { AppError } from "../../utils/AppError";

export class PostController {
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const post = await postService.create(
      req.user,
      req.body as CreatePostInput
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: post,
    });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { body, cacheStatus } = await postService.listPublished(
      req.validatedQuery as ListPostsQuery
    );

    res.setHeader("X-Cache", cacheStatus);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: body.data,
      pagination: body.pagination,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { post, cacheStatus } = await postService.getPublishedById(
      req.params.id as string
    );

    res.setHeader("X-Cache", cacheStatus);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: post,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const post = await postService.update(
      req.params.id as string,
      req.user,
      req.body as UpdatePostInput
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: post,
    });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    await postService.remove(req.params.id as string, req.user);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Post deleted successfully",
    });
  };

  listMine = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const posts = await postService.listMine(req.user._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: posts,
    });
  };
}

export const postController = new PostController();

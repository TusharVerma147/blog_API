import { commentRepository } from "../../Repository/comment.repository";
import { postRepository } from "../../Repository/post.repository";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { assertObjectId } from "../../utils/objectId";
import { invalidatePostCache } from "../../utils/postCache";
import { AuthUser } from "../../types/express";
import { CreateCommentInput, ListCommentsQuery } from "./comment.validation";

export class CommentService {
  async create(postId: string, user: AuthUser, input: CreateCommentInput) {
    const objectId = assertObjectId(postId, "post ID");
    const post = await postRepository.findPublishedById(objectId);

    if (!post) {
      throw new AppError("Published post not found", HTTP_STATUS.NOT_FOUND);
    }

    const comment = await commentRepository.create({
      postId: objectId,
      userId: user._id,
      userName: user.name,
      text: input.text,
    });

    await postRepository.incrementCommentCount(objectId, 1);
    // commentCount changed → drop single-post cache + bump list version
    await invalidatePostCache(objectId.toString());

    return comment;
  }

  async listByPost(postId: string, query: ListCommentsQuery) {
    const objectId = assertObjectId(postId, "post ID");
    const post = await postRepository.findPublishedById(objectId);

    if (!post) {
      throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    const { data, total } = await commentRepository.listByPostId(
      objectId,
      query.page,
      query.limit
    );

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async remove(commentId: string, user: AuthUser) {
    const objectId = assertObjectId(commentId, "comment ID");
    const comment = await commentRepository.findById(objectId);

    if (!comment) {
      throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
    }

    const post = await postRepository.findById(comment.postId);

    if (!post) {
      throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    const isCommentAuthor = comment.userId.toString() === user._id.toString();
    const isPostAuthor = post.author.toString() === user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      throw new AppError(
        "You are not allowed to delete this comment",
        HTTP_STATUS.FORBIDDEN
      );
    }

    await commentRepository.deleteById(objectId);
    await postRepository.incrementCommentCount(comment.postId, -1);
    await invalidatePostCache(comment.postId.toString());
  }
}

export const commentService = new CommentService();

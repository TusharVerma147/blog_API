import { Types } from "mongoose";
import { postRepository } from "../../Repository/post.repository";
import { commentRepository } from "../../Repository/comment.repository";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { assertObjectId } from "../../utils/objectId";
import { AuthUser } from "../../types/express";
import {
  bumpPostsListVersion,
  getCachedPost,
  getCachedPostList,
  invalidatePostCache,
  setCachedPost,
  setCachedPostList,
  CacheStatus,
  PostListResponse,
} from "../../utils/postCache";
import {
  CreatePostInput,
  UpdatePostInput,
  ListPostsQuery,
} from "./post.validation";

export class PostService {
  private normalizeTags(tags: string[] = []): string[] {
    return tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean);
  }

  async create(user: AuthUser, input: CreatePostInput) {
    const post = await postRepository.create({
      title: input.title,
      body: input.body,
      tags: this.normalizeTags(input.tags),
      author: user._id,
      authorName: user.name,
      status: input.status,
    });

    // Write Mongo first, then invalidate list cache via version bump
    await bumpPostsListVersion();

    return post;
  }

  async getPublishedById(
    id: string
  ): Promise<{ post: unknown; cacheStatus: CacheStatus }> {
    const objectId = assertObjectId(id, "post ID");
    const postId = objectId.toString();

    const cached = await getCachedPost(postId);
    if (cached) {
      return cached;
    }

    const post = await postRepository.findPublishedById(objectId);

    if (!post) {
      throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    // Only cache published posts (never drafts / 404s)
    await setCachedPost(postId, post);

    return { post, cacheStatus: "MISS" };
  }

  async listPublished(
    query: ListPostsQuery
  ): Promise<{ body: PostListResponse; cacheStatus: CacheStatus }> {
    const cached = await getCachedPostList(query);
    if (cached) {
      return cached;
    }

    const { data, total } = await postRepository.listPublished({
      page: query.page,
      limit: query.limit,
      search: query.search,
      tag: query.tag?.toLowerCase(),
      sort: query.sort,
    });

    const body: PostListResponse = {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };

    await setCachedPostList(query, body);

    return { body, cacheStatus: "MISS" };
  }

  async listMine(userId: Types.ObjectId) {
    // Intentionally not cached (private, changes often)
    return postRepository.findByAuthor(userId);
  }

  async update(id: string, user: AuthUser, input: UpdatePostInput) {
    const objectId = assertObjectId(id, "post ID");
    const post = await postRepository.findById(objectId);

    if (!post) {
      throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    if (post.author.toString() !== user._id.toString()) {
      throw new AppError(
        "You are not allowed to update this post",
        HTTP_STATUS.FORBIDDEN
      );
    }

    const update: Record<string, unknown> = { ...input };
    if (input.tags) {
      update.tags = this.normalizeTags(input.tags);
    }

    const updated = await postRepository.updateById(objectId, update);

    if (!updated) {
      throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    await invalidatePostCache(objectId.toString());

    return updated;
  }

  async remove(id: string, user: AuthUser) {
    const objectId = assertObjectId(id, "post ID");
    const post = await postRepository.findById(objectId);

    if (!post) {
      throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    if (post.author.toString() !== user._id.toString()) {
      throw new AppError(
        "You are not allowed to delete this post",
        HTTP_STATUS.FORBIDDEN
      );
    }

    await commentRepository.deleteByPostId(objectId);
    await postRepository.deleteById(objectId);
    await invalidatePostCache(objectId.toString());
  }
}

export const postService = new PostService();

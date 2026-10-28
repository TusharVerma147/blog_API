import { Types, UpdateQuery } from "mongoose";
import { Post, IPost } from "../model/Post";

export type ListPublishedParams = {
  page: number;
  limit: number;
  search?: string;
  tag?: string;
  sort: "newest" | "oldest" | "mostCommented";
};

export const postRepository = {
  async create(data: {
    title: string;
    body: string;
    tags: string[];
    author: Types.ObjectId;
    authorName: string;
    status: "draft" | "published";
  }): Promise<IPost> {
    const post = await Post.create(data);
    return post.toObject() as IPost;
  },

  async findById(id: string | Types.ObjectId): Promise<IPost | null> {
    return Post.findById(id);
  },

  async findPublishedById(id: string | Types.ObjectId): Promise<IPost | null> {
    return Post.findOne({ _id: id, status: "published" });
  },

  async findByAuthor(authorId: Types.ObjectId): Promise<IPost[]> {
    return Post.find({ author: authorId }).sort({ createdAt: -1 });
  },

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<IPost>
  ): Promise<IPost | null> {
    return Post.findByIdAndUpdate(id, update, {
      returnDocument: "after",
      runValidators: true,
    });
  },

  async deleteById(id: string | Types.ObjectId): Promise<IPost | null> {
    return Post.findByIdAndDelete(id);
  },

  async incrementCommentCount(
    id: string | Types.ObjectId,
    by: number
  ): Promise<void> {
    if (by < 0) {
      await Post.updateOne(
        { _id: id, commentCount: { $gt: 0 } },
        { $inc: { commentCount: by } }
      );
      return;
    }

    await Post.updateOne({ _id: id }, { $inc: { commentCount: by } });
  },



  async listPublished(params: ListPublishedParams): Promise<{
    data: IPost[];
    total: number;
  }> {
    const filter: Record<string, unknown> = { status: "published" };

    if (params.search) {
      filter.title = { $regex: params.search, $options: "i" };
    }

    if (params.tag) {
      filter.tags = params.tag.toLowerCase();
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (params.sort === "oldest") {
      sort = { createdAt: 1 };
    } else if (params.sort === "mostCommented") {
      sort = { commentCount: -1, createdAt: -1 };
    }

    const skip = (params.page - 1) * params.limit;

    const result = await Post.aggregate<{
      data: IPost[];
      totalCount: { count: number }[];
    }>([
      { $match: filter },
      {
        $facet: {
          data: [
            { $sort: sort },
            { $skip: skip },
            { $limit: params.limit },
            { $project: { body: 0 } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const facet = result[0];
    const total = facet?.totalCount[0]?.count ?? 0;

    return {
      data: facet?.data ?? [],
      total,
    };
  },
};

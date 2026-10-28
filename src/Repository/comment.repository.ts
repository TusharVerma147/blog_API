import { Types } from "mongoose";
import { Comment, IComment } from "../model/Comment";

export const commentRepository = {
  async create(data: {
    postId: Types.ObjectId;
    userId: Types.ObjectId;
    userName: string;
    text: string;
  }): Promise<IComment> {
    const comment = await Comment.create(data);
    return comment.toObject() as IComment;
  },

  async findById(id: string | Types.ObjectId): Promise<IComment | null> {
    return Comment.findById(id);
  },

  async deleteById(id: string | Types.ObjectId): Promise<IComment | null> {
    return Comment.findByIdAndDelete(id);
  },

  async deleteByPostId(postId: string | Types.ObjectId): Promise<void> {
    await Comment.deleteMany({ postId });
  },

  async listByPostId(
    postId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{ data: IComment[]; total: number }> {
    const skip = (page - 1) * limit;

    const result = await Comment.aggregate<{
      data: IComment[];
      totalCount: { count: number }[];
    }>([
      { $match: { postId } },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
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

import { Post } from "../model/Post";

export type StatsResult = {
  totalPublishedPosts: number;
  topTags: { tag: string; count: number }[];
  topAuthors: { authorId: unknown; name: string; postCount: number }[];
  mostCommentedPosts: {
    _id: unknown;
    title: string;
    commentCount: number;
  }[];
};

export const statsRepository = {
  async getBlogStats(): Promise<StatsResult> {
    const result = await Post.aggregate<{
      totalPublished: { count: number }[];
      topTags: { tag: string; count: number }[];
      topAuthors: { authorId: unknown; name: string; postCount: number }[];
      mostCommented: {
        _id: unknown;
        title: string;
        commentCount: number;
      }[];
    }>([
      { $match: { status: "published" } },
      {
        $facet: {
          totalPublished: [{ $count: "count" }],
          topTags: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, tag: "$_id", count: 1 } },
          ],
          topAuthors: [
            { $group: { _id: "$author", postCount: { $sum: 1 } } },
            { $sort: { postCount: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                authorId: "$_id",
                name: { $ifNull: ["$user.name", "Unknown"] },
                postCount: 1,
              },
            },
          ],
          mostCommented: [
            { $sort: { commentCount: -1, createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                title: 1,
                commentCount: 1,
              },
            },
          ],
        },
      },
    ]);

    const facet = result[0];

    return {
      totalPublishedPosts: facet?.totalPublished[0]?.count ?? 0,
      topTags: facet?.topTags ?? [],
      topAuthors: facet?.topAuthors ?? [],
      mostCommentedPosts: facet?.mostCommented ?? [],
    };
  },
};

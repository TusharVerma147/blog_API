import mongoose, { Schema, InferSchemaType } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 120,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      minlength: 20,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 5,
        message: "A post can have at most 5 tags",
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ tags: 1 });
postSchema.index({ status: 1, createdAt: -1 });

export type IPost = InferSchemaType<typeof postSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Post = mongoose.model("Post", postSchema);

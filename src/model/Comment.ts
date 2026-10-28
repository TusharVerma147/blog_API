import mongoose, { Schema, InferSchemaType } from "mongoose";

const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });

export type IComment = InferSchemaType<typeof commentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Comment = mongoose.model("Comment", commentSchema);

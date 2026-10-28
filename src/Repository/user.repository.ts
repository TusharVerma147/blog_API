import { User, IUser } from "../model/User";
import { Types } from "mongoose";

export const userRepository = {
  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    const user = await User.create(data);
    return user.toObject() as IUser;
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select("+password");
  },

  async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    return User.findById(id);
  },

  async updateName(
    id: string | Types.ObjectId,
    name: string
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { name }, {
      returnDocument: "after",
      runValidators: true,
    });
  },
};

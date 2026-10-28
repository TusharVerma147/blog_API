import { Types } from "mongoose";
import { Session, ISession } from "../model/Session";

export const sessionRepository = {
  async create(data: {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;
    userAgent: string;
  }): Promise<ISession> {
    const session = await Session.create(data);
    return session.toObject() as ISession;
  },

  async findByToken(token: string): Promise<ISession | null> {
    return Session.findOne({ token });
  },

  async deleteByToken(token: string): Promise<void> {
    await Session.deleteOne({ token });
  },
};

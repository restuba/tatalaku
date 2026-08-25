import { Schema, model, type Document } from "mongoose";
import type { User } from "@tatalaku/shared";

// UserDocument includes passwordHash which is intentionally NOT part of the shared User type
// to prevent it from leaking into API responses
export interface UserDocument extends Omit<User, "id">, Document {
  passwordHash: string;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    passwordHash: {
      type: String,
      required: true,
      // Never selected by default to prevent accidental exposure
      select: false,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
  },
);

export const UserModel = model<UserDocument>("User", userSchema);

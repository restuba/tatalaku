import { Schema, model, type Document } from "mongoose";

export interface RefreshTokenDocument extends Document {
  /** The SHA-256 hash of the refresh token (never store raw token) */
  tokenHash: string;
  /** The user this token belongs to */
  userId: string;
  /** Token family — all tokens derived from the same login share a family.
   *  If a token from an already-used family is replayed, the entire family is revoked. */
  family: string;
  /** When this token expires (MongoDB TTL auto-deletes expired docs) */
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    family: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
  },
);

// TTL index — MongoDB automatically deletes documents when expiresAt passes
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);

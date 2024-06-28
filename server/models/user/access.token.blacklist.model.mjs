import mongoose from "mongoose";

const accessTokenSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessTokens: [{ type: String }],
  },
  { timestamps: true }
);

export const AccessTokenModel = mongoose.model(
  "Access Token",
  accessTokenSchema
);

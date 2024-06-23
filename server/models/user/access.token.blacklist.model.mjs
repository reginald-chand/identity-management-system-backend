import mongoose from "mongoose";

const accessTokenSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  accessTokens: [{ type: String }],
});

export const AccessTokenModel = mongoose.model(
  "AccessToken",
  accessTokenSchema
);

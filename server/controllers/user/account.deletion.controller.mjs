import { AccessTokenModel } from "../../models/user/access.token.blacklist.model.mjs";
import { SignUpModel } from "../../models/auth/signup.model.mjs";
import { logger } from "../../configs/logger.config.mjs";
import mongoose from "mongoose";
import { userObjectValidator } from "../../validators/user/user.object.validator.mjs";

export const accountDeletionController = async (request, response) => {
  const { error, value } = userObjectValidator.validate(request.body);

  const accessToken = request.headers.authorization;

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const { user } = value;
  const { userName } = request.params;

  try {
    const existingUser = await SignUpModel.findOne({
      email: { $eq: user.email },
    });

    if (!existingUser) {
      return response.status(401).json({ responseMessage: "UnAuthorized." });
    }

    if (userName !== existingUser.userName) {
      return response.status(404).json({ responseMessage: "User not found." });
    }

    const existingAccessTokens = await AccessTokenModel.exists({
      accessTokens: { $eq: accessToken },
    });

    if (existingAccessTokens) {
      return response
        .status(403)
        .json({ responseMessage: "Cannot delete account." });
    }

    const database = mongoose.connection.db;
    const collections = await database.listCollections().toArray();

    collections.forEach(async (collection) => {
      await database
        .collection(collection.name)
        .deleteMany({ _id: { $eq: existingUser._id } });

      await database
        .collection(collection.name)
        .deleteMany({ userId: { $eq: existingUser._id } });
    });

    return response
      .status(200)
      .json({ responseMessage: "Account deleted successfully." });
  } catch (error) {
    logger.log({
      level: "error",
      message: error,
      additional: "Internal server error.",
    });

    return response
      .status(500)
      .json({ responseMessage: "Internal server error." });
  }
};

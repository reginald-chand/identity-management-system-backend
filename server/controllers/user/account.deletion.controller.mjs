import { AccessTokenModel } from "../../models/user/access.token.blacklist.model.mjs";
import { ProfileModel } from "../../models/user/profile.model.mjs";
import { SignUpModel } from "../../models/auth/signup.model.mjs";
import { logger } from "../../configs/logger.config.mjs";
import { userObjectValidator } from "../../validators/user/user.object.validator.mjs";

export const accountDeletionController = async (request, response) => {
  const { error, value } = userObjectValidator.validate(request.body);

  const accessToken = request.headers.authorization;

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const { user } = value;
  const { email, id } = user;
  const { userName } = request.params;

  try {
    const existingUser = await SignUpModel.findOne({ email: { $eq: email } });

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

    await SignUpModel.findOneAndDelete({ _id: { $eq: id } });
    await ProfileModel.findOneAndDelete({ _id: { $eq: id } });
    await AccessTokenModel.findOneAndDelete({ _id: { $eq: id } });

    response
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
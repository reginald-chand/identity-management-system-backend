import { AccessTokenModel } from "../../models/user/access.token.blacklist.model.mjs";
import { SignUpModel } from "../../models/auth/signup.model.mjs";
import { logger } from "../../configs/logger.config.mjs";
import { userObjectValidator } from "../../validators/user/user.object.validator.mjs";

export const logoutController = async (request, response) => {
  const { error, value } = userObjectValidator.validate(request.body);

  const accessToken = request.headers.authorization;
  const refreshToken = request.cookies.refreshToken;

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const { user } = value;
  const { userName } = request.params;

  if (!accessToken && refreshToken) {
    return response.status(403).json({ responseMessage: "Cannot logout." });
  }

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

    const accessTokenModel = await AccessTokenModel.findOne({
      _id: { $eq: existingUser._id },
    });

    if (!accessTokenModel) {
      return response.status(403).json({ responseMessage: "Cannot logout." });
    }

    const existingAccessTokens = await AccessTokenModel.exists({
      accessTokens: { $eq: accessToken },
    });

    if (existingAccessTokens) {
      return response.status(403).json({ responseMessage: "Cannot logout." });
    }

    accessTokenModel.accessTokens.push(accessToken);
    await accessTokenModel.save();

    return response
      .status(200)
      .header("Authorization", "")
      .clearCookie("refreshToken")
      .json({ response: "Logout Successful." });
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

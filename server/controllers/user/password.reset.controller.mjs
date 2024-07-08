import { SignUpModel } from "../../models/auth/signup.model.mjs";
import bcrypt from "bcryptjs";
import { logger } from "../../configs/logger.config.mjs";
import { passwordResetControllerValidator } from "../../validators/user/password.reset.controller.validator.mjs";
import { redisClient } from "../../configs/redis.client.config.mjs";

export const passwordResetController = async (request, response) => {
  const { error, value } = passwordResetControllerValidator.validate(
    request.body
  );

  const accessToken = request.headers.authorization;

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const { password, csrfToken, user } = value;
  const { userName } = request.params;

  if (!accessToken) {
    return response.status(403).json({ responseMessage: "UnAuthorized." });
  }

  try {
    const userSession = await redisClient.hGetAll(user.email);

    if (csrfToken !== userSession.csrfToken) {
      return response.status(401).json({ responseMessage: "UnAuthorized." });
    }

    const existingUser = await SignUpModel.findOne({
      email: { $eq: user.email },
    });

    if (!existingUser) {
      return response.status(401).json({ responseMessage: "UnAuthorized." });
    }

    if (userName !== existingUser.userName) {
      return response.status(404).json({ responseMessage: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await SignUpModel.findOneAndUpdate({ password: hashedPassword });

    return response.status(200).json({
      responseMessage: "You have successfully updated your password.",
    });
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

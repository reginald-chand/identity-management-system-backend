import { ProfileModel } from "../../models/user/profile.model.mjs";
import { SignUpModel } from "../../models/auth/signup.model.mjs";
import { logger } from "../../configs/logger.config.mjs";
import { userObjectValidator } from "../../validators/user/user.object.validator.mjs";

export const profileController = async (request, response) => {
  const { error, value } = userObjectValidator.validate(request.body);

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

    const userProfile = await ProfileModel.findById(existingUser._id);
    const userData = { ...user, userProfile };

    return response.status(200).json({ responseMessage: userData });
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

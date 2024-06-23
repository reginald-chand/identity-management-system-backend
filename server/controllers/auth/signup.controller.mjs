import { AccessTokenModel } from "../../models/user/access.token.blacklist.model.mjs";
import { ProfileModel } from "../../models/user/profile.model.mjs";
import { SignUpModel } from "../../models/auth/signup.model.mjs";
import { logger } from "../../configs/logger.config.mjs";
import { signUpControllerValidator } from "../../validators/auth/signup.controller.validator.mjs";

export const signUpController = async (request, response) => {
  const { error, value } = signUpControllerValidator.validate(request.body);

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const { firstName, middleName, lastName, userName, email, password } = value;

  try {
    const existingUser = await SignUpModel.exists({ email: { $eq: email } });
    const existingUserName = await SignUpModel.exists({
      userName: { $eq: userName },
    });

    if (existingUser || existingUserName) {
      return response.status(409).json({
        responseMessage: "Email or UserName is invalid. Please try again!",
      });
    }

    const newUserAccountInformation = {
      firstName,
      middleName,
      lastName,
      userName,
      email,
      password,
      isUserVerified: false,
    };

    const newUser = await SignUpModel.create(newUserAccountInformation);

    const newUserProfileInformation = {
      _id: newUser._id,
      firstName: newUser.firstName,
      middleName: newUser.middleName,
      lastName: newUser.lastName,
      userName: newUser.userName,
      email: newUser.email,
    };

    await ProfileModel.create(newUserProfileInformation);

    const newUserAccessTokenInformation = {
      _id: newUser._id,
    };

    await AccessTokenModel.create(newUserAccessTokenInformation);

    return response.status(201).json({
      responseMessage:
        "Congratulations. Your account has been created successfully.",
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: error,
      additional: "Internal server error.",
    });

    return response.status(500).json({
      responseMessage: "Internal server error.",
    });
  }
};

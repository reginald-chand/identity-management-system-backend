import { ProfileModel } from "../../models/user/profile.model.mjs";
import { SignUpModel } from "../../models/auth/signup.model.mjs";
import { logger } from "../../configs/logger.config.mjs";
import { profileUpdateControllerValidator } from "../../validators/user/profile.update.controller.validator.mjs";

export const profileUpdateController = async (request, response) => {
  const { error, value } = profileUpdateControllerValidator.validate(
    request.body
  );

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const {
    firstName,
    middleName,
    lastName,
    userName,
    email,
    phone,
    dateOfBirth,
    age,
    gender,
    occupation,
    country,
    user,
  } = value;

  try {
    const existingUser = await SignUpModel.findOne({
      email: { $eq: user.email },
    });

    const existingUsersEmail = await SignUpModel.exists({
      email: { $eq: email },
    });

    const existingUsersUserName = await SignUpModel.exists({
      userName: { $eq: userName },
    });

    if (existingUsersEmail !== null) {
      if (existingUsersEmail) {
        return response.status(409).json({
          responseMessage: "Email is invalid. Please choose another email.",
        });
      }
    }

    if (existingUsersUserName !== null) {
      if (existingUsersUserName) {
        return response.status(409).json({
          responseMessage:
            "UserName is invalid. Please choose another username.",
        });
      }
    }

    const updateProfileUserData = {
      $set: {
        firstName,
        middleName,
        lastName,
        userName,
        email,
        phone,
        dateOfBirth,
        age,
        gender,
        occupation,
        country,
      },
    };

    // * Payload will be updated on next user login but the profile will respond to immediate change of information.
    const updatePayloadUserData = {
      $set: { firstName, middleName, lastName, userName, email },
    };

    if (existingUser) {
      await ProfileModel.findOneAndUpdate(
        { email: existingUser.email },
        updateProfileUserData,
        { new: true, upsert: true }
      );

      await SignUpModel.findOneAndUpdate(
        { email: existingUser.email },
        updatePayloadUserData,
        { new: true, upsert: true }
      );

      return response.status(200).json({
        responseMessage: "User information has been successfully updated.",
      });
    }

    return response.status(401).json({ responseMessage: "UnAuthorized." });
  } catch (error) {
    logger.log({
      level: "error",
      message: error,
    });

    return response.status(500).json({
      responseMessage: "Internal server error.",
    });
  }
};

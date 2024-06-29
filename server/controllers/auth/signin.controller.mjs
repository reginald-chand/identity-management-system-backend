import { AccessTokenModel } from "../../models/user/access.token.blacklist.model.mjs";
import { SignUpModel } from "../../models/auth/signup.model.mjs";
import bcrypt from "bcryptjs";
import { cookieOptions } from "../../configs/cookie.options.config.mjs";
import { customCsrfGeneratorUtil } from "../../utils/custom.csrf.generator.util.mjs";
import jwt from "jsonwebtoken";
import { logger } from "../../configs/logger.config.mjs";
import { persistCsrfUtil } from "../../utils/persist.csrf.util.mjs";
import { signInControllerValidator } from "../../validators/auth/signin.controller.validator.mjs";

export const signInController = async (request, response) => {
  const { error, value } = signInControllerValidator.validate(request.body);

  if (error) {
    return response.status(400).json({ responseMessage: error.message });
  }

  const { email, password } = value;

  try {
    const existingUser = await SignUpModel.findOne({ email: { $eq: email } });

    if (!existingUser) {
      return response
        .status(401)
        .json({ responseMessage: "Email or Password is incorrect." });
    }

    const matchPasswordHash = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!matchPasswordHash) {
      return response
        .status(401)
        .json({ responseMessage: "Email or Password is incorrect." });
    }

    const csrfToken = customCsrfGeneratorUtil();

    persistCsrfUtil(csrfToken, existingUser.userName, existingUser.email);

    const userInformation = {
      id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      userName: existingUser.userName,
      email: existingUser.email,
      csrfToken: csrfToken,
    };

    const accessToken = jwt.sign(userInformation, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    if (!accessToken) {
      return response.status(404).json({ responseMessage: "Token not found." });
    }

    const existingAccessTokens = await AccessTokenModel.exists({
      accessTokens: { $eq: accessToken },
    });

    if (existingAccessTokens) {
      return response.status(403).json({ responseMessage: "Cannot login." });
    }

    const refreshToken = jwt.sign(userInformation, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    return response
      .status(200)
      .header("Authorization", accessToken)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        responseMessage: `Login Successful. Welcome ${existingUser.firstName} ${existingUser.lastName}`,
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

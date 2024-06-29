import { cookieOptions } from "../configs/cookie.options.config.mjs";
import jwt from "jsonwebtoken";
import { logger } from "../configs/logger.config.mjs";
import { persistCsrfUtil } from "../utils/persist.csrf.util.mjs";

export const jwtAuthMiddleware = async (request, response, next) => {
  const accessToken = request.headers.authorization;

  if (!accessToken) {
    return response.status(404).json({ responseMessage: "Token not found." });
  }

  try {
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    request.body = { ...request.body, user: payload };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      logger.log({ level: "error", message: error.message });
      return response.status(401).json({ responseMessage: error.message });
    }

    if (error.name === "TokenExpiredError") {
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        return response
          .status(404)
          .json({ responseMessage: "Token not found." });
      }

      try {
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

        persistCsrfUtil(payload.csrfToken, payload.userName, payload.email);

        const userInformation = {
          id: payload._id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          userName: payload.userName,
          email: payload.email,
          csrfToken: payload.csrfToken,
        };

        const newAccessToken = jwt.sign(
          userInformation,
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );

        const newRefreshToken = jwt.sign(
          userInformation,
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1d",
          }
        );

        return response
          .status(200)
          .header("Authorization", newAccessToken)
          .cookie("refreshToken", newRefreshToken, cookieOptions)
          .json({
            responseMessage: `Login Successful. Welcome ${payload.firstName} ${payload.lastName}`,
          });
      } catch (error) {
        if (
          error.name === "TokenExpiredError" ||
          error.name === "JsonWebTokenError" ||
          error.name === "NotBeforeError"
        ) {
          logger.log({ level: "error", message: error.message });
          return response.status(401).json({ responseMessage: error.message });
        }
      }
    }

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

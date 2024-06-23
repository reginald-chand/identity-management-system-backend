import { logger } from "../../configs/logger.config.mjs";

export const csrfController = async (request, response) => {
  const csrfToken = request.csrfToken();

  if (!csrfToken) {
    response.status(404).json({ responseMessage: "CSRF Token not found." });
  }

  try {
    response.status(201).json({ responseMessage: { csrfToken: csrfToken } });
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

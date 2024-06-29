import Joi from "joi";

export const userObjectValidator = Joi.object({
  csrfToken: Joi.string(),

  user: Joi.object().required(),
});

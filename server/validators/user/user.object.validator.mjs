import Joi from "joi";

export const userObjectValidator = Joi.object({
  _csrf: Joi.string(),

  user: Joi.object().required(),
});

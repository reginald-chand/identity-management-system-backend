import Joi from "joi";

export const uriParamValidator = Joi.object({
  userName: Joi.string().pattern(new RegExp("^[a-z]+$")).required(),
});

import Joi from "joi";

export const passwordResetControllerValidator = Joi.object({
  csrfToken: Joi.string().required(),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
      )
    )
    .required(),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  user: Joi.object().required(),
});

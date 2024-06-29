import Joi from "joi";

export const signUpControllerValidator = Joi.object({
  firstName: Joi.string().pattern(new RegExp("^[A-Z].*$")).required(),
  middleName: Joi.string().pattern(new RegExp("^[A-Z].*$")),
  lastName: Joi.string().pattern(new RegExp("^[A-Z].*$")).required(),
  userName: Joi.string().pattern(new RegExp("^[a-z]+$")).required(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
      )
    )
    .required(),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

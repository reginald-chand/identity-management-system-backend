import Joi from "joi";

export const profileUpdateControllerValidator = Joi.object({
  csrfToken: Joi.string().required(),

  firstName: Joi.string().pattern(new RegExp("^[A-Z].*$")),
  middleName: Joi.string().pattern(new RegExp("^[A-Z].*$")),
  lastName: Joi.string().pattern(new RegExp("^[A-Z].*$")),
  userName: Joi.string().pattern(new RegExp("^[a-z]+$")),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),

  phone: Joi.string().pattern(new RegExp("^(d{2,3})sd{3}sd+$")),
  dateOfBirth: Joi.string().pattern(
    new RegExp("^(0[1-9]|[12][0-9]|3[01])\\/(0[1-9]|1[012])\\/(19|20)\\d\\d$")
  ),

  age: Joi.number(),
  gender: Joi.string().pattern(new RegExp("^[A-Z][a-z]*(?: [A-Z][a-z]*)?$")),
  occupation: Joi.string().pattern(
    new RegExp("^[A-Z][a-z]*(?: [A-Z][a-z]*)?$")
  ),

  country: Joi.string().pattern(new RegExp("^[A-Z][a-z]*(?: [A-Z][a-z]*)?$")),
  user: Joi.object().required(),
});

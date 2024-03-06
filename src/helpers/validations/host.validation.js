import Joi from "joi";

export const createHostValidation = Joi.object({
  fname: Joi.string().required().messages({
    "any.required": `Please provide the valid name.`,
    "string.base": "Please provide the valid name",
  }),
  lname: Joi.string().required().messages({
    "any.required": "Please provide the valid name",
    "string.base": "Please provide the valid name",
  }),
  gender: Joi.string().valid("Male", "Female", "Others").optional(),
  termsAndCondition: Joi.boolean().required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .min(7)
    .max(12)
    .pattern(/^[0-9]+$/)
    .optional(),
  password: Joi.string().required(),
  address: Joi.object().required(),
});

export const otpVerificationValidation = Joi.object({
  otp: Joi.string().required(),
  id: Joi.string().required(),
});

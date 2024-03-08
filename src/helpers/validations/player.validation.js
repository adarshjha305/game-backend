import Joi from 'joi';

export const createPlayerValidation  = Joi.object({
    fname: Joi.string().required().messages({
      "any.required": `Please provide the valid name.`,
      "string.base": "Please provide the valid name",
    }),
    lname: Joi.string().required().messages({
      "any.required": "Please provide the valid name",
      "string.base": "Please provide the valid name",
    }),
    gender: Joi.string().valid("Male", "Female", "Others").optional(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .min(7)
      .max(12)
      .pattern(/^[0-9]+$/)
      .optional(),
    address: Joi.object().required(),
  });
  
  export const playerOtpVerificationValidation = Joi.object({
    otp: Joi.string().required(),
    id: Joi.string().required(),
  });
  
  export const loginVerificationValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });


  export const updatePlayerValidation = Joi.object({
    fname: Joi.string().optional().messages({
      "any.required": `Please provide the valid name.`,
      "string.base": "Please provide the valid name",
    }),
    lname: Joi.string().optional().messages({
      "any.required": "Please provide the valid name",
      "string.base": "Please provide the valid name",
    }),
    gender: Joi.string().valid("Male", "Female", "Others").optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .min(7)
      .max(12)
      .pattern(/^[0-9]+$/)
      .optional(),
    address: Joi.object().optional(),
  });


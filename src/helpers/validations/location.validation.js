import Joi from "joi";

export const createLocationValidation = Joi.object({
  hostId: Joi.string().required(),
  line1: Joi.string().required(),
  line2: Joi.string(),
  pinCode: Joi.string(),
  city: Joi.string().required(),
  state: Joi.string(),
  country: Joi.string().required(),
});
export const updateLocationValidation = Joi.object({
  id: Joi.string().required(),
  hostId: Joi.string().required(),
  line1: Joi.string().required(),
  line2: Joi.string(),
  pinCode: Joi.string(),
  city: Joi.string().required(),
  state: Joi.string(),
  country: Joi.string().required(),
});

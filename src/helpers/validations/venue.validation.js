import Joi from "joi";

export const createVenueValidation = Joi.object({
  locationId: Joi.string().required(),
  hostId: Joi.string().required(),
  details: Joi.string().required(),
});
export const updateVenueValidation = Joi.object({
  id: Joi.string().required(),
  locationId: Joi.string().required(),
  hostId: Joi.string().required(),
  details: Joi.string().required(),
});

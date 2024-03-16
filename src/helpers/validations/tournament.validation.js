import Joi from "joi";

export const tournamentValidation = Joi.object({
  gameId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  startDateAndTime: Joi.string().required(),
  registrationEndDateTime: Joi.string().required(),
  banner: Joi.string().uri().required(),
  tournamentFee: Joi.number().required(),
  paymentAmount: Joi.number().required(),
  contactPerson: Joi.string().required(),
  contactPhone: Joi.string().required(),
  contactEmail: Joi.string().email().required(),
});

export const tournamentFixingValidation = Joi.object({
  tournamentId: Joi.string().required(),
  eventId: Joi.number().required(),
});

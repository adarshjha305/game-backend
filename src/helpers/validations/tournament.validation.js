import Joi from "joi";

export const tournamentValidation = Joi.object({
  hostId: Joi.string().required(),
  locationId: Joi.string().required(),
  gameId: Joi.string().required(),
  venueId: Joi.array().items(Joi.string()).required(),
  numOfSets: Joi.number().required(),
  maxPoints: Joi.number().valid(11, 21).required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  gameType: Joi.string().valid("KNOCK_OUT", "ROUND_ROBIN").required(),
  type: Joi.string().valid("SOLO", "DUO").required(),
  startDateAndTime: Joi.string().required(),
  endDateAndTime: Joi.string().required(),
  maxParticipants: Joi.number().required(),
  minParticipants: Joi.number().required(),
  registrationEndDateTime: Joi.string().required(),
  gender: Joi.string().valid("MALE", "FEMALE", "ALL").required(),
  banner: Joi.string().uri().required(),
  minAge: Joi.string().required(),
  maxAge: Joi.string().required(),
  tournamentFee: Joi.number().required(),
  contactPerson: Joi.string().required(),
  contactPhone: Joi.string().required(),
  contactEmail: Joi.string().email().required(),
});

export const tournamentFixingValidation = Joi.object({
  tournamentId: Joi.string().required(),
  eventId: Joi.number().required(),
});

import Joi from "joi";

export const createEventValidation = Joi.object({
  locationId: Joi.string().required(),
  tournamentId: Joi.string().required(),
  status: Joi.string()
    .valid("DRAFT", "ACTIVE", "IN-PROGRESS", "CANCELLED")
    .default("DRAFT"),
  numOfSets: Joi.number().required(),
  maxPoints: Joi.number().required(),
  venueId: Joi.array().required(),
  gameType: Joi.string().valid("KNOCK_OUT", "ROUND_ROBIN").required(),
  type: Joi.string().valid("SOLO", "DUO").required(),
  maxParticipants: Joi.number().required(),
  minParticipants: Joi.number().required(),
  gender: Joi.string().valid("MALE", "FEMALE", "ALL").required(),
  minAge: Joi.string().required(),
  maxAge: Joi.string().required(),
  tournamentFee: Joi.number().required(),
  description: Joi.string(),
  isActive: Joi.boolean().required(),
  startDateAndTime: Joi.string().required(),
  dayStartTime: Joi.string().required(),
  dayEndTime: Joi.string().required(),
  perMatchMaxTime: Joi.number().required(),
  perMatchRestTime: Joi.number().required(),
});

export const updateEventValidation = Joi.object({
  id: Joi.string().required(),
  hostId: Joi.string().required(),
  locationId: Joi.string().required(),
  tournamentId: Joi.string().required(),
  status: Joi.string()
    .valid("DRAFT", "ACTIVE", "IN-PROGRESS", "CANCELLED")
    .default("DRAFT"),
  numOfSets: Joi.number().required(),
  maxPoints: Joi.number().required(),
  venueId: Joi.array().required(),
  gameType: Joi.string().valid("KNOCK_OUT", "ROUND_ROBIN").required(),
  type: Joi.string().valid("SOLO", "DUO").required(),
  maxParticipants: Joi.number().required(),
  minParticipants: Joi.number().required(),
  gender: Joi.string().valid("MALE", "FEMALE", "ALL").required(),
  minAge: Joi.string().required(),
  maxAge: Joi.string().required(),
  tournamentFee: Joi.number().required(),
  description: Joi.string(),
  isActive: Joi.boolean().required(),
  startDateAndTime: Joi.string().required(),
  dayStartTime: Joi.string().required(),
  dayEndTime: Joi.string().required(),
  perMatchMaxTime: Joi.number().required(),
  perMatchRestTime: Joi.number().required(),
});

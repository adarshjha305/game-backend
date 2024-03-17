import Joi from "joi";

export const updateMatchValidation = Joi.object({
  id: Joi.string().required(),
  startDateAndTime: Joi.string().required(),
  venueId: Joi.string().required(),
  status: Joi.string().required(),
});

export const scoreUpdateMatchValidation = Joi.object({
  id: Joi.string().required(),
  tournamentId: Joi.string().required(),
  eventId: Joi.string().required(),
  score: Joi.array()
    .items(
      Joi.object({
        teamId: Joi.string().required(),
        score: Joi.number().required(),
      })
    )
    .required()
    .length(2),
});

export const startMatchValidation = Joi.object({
  matchId: Joi.string().required(),
  venueId: Joi.string().required(),
});

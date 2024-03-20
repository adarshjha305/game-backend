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
  totalScore: Joi.object({
    setScore: Joi.array()
      .items(
        Joi.object({
          teamId: Joi.string().required(),
          score: Joi.number().required(),
        })
      )
      .required()
      .length(2),
    setNumber: Joi.number().required(),
    isCompleted: Joi.boolean().required(),
    winner: Joi.string(),
  }),
});

export const startMatchValidation = Joi.object({
  matchId: Joi.string().required(),
  venueId: Joi.string().required(),
});

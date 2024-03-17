import Joi from 'joi';



export const addParticipantValidation = Joi.object({
    eventId: Joi.string().required(),
    teamName:Joi.string().required(),
    tournamentId: Joi.string().required(),
    playerIds: Joi.array().items(Joi.string()).required(),
  });
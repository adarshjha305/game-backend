import Joi from 'joi';



export const addParticipantValidation = Joi.object({
    hostId:Joi.string().required(),
    tournamentId: Joi.string().required(),
    playerId: Joi.string().required(),
    teamId:Joi.string().required(),
  });
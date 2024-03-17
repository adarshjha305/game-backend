import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import ParticipantModel from "../../models/participant";
import { CustomError } from "../../helpers/custome.error";
import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import PlayerModel from "../../models/player";
import { addParticipantValidation } from "../../helpers/validations/participant.validation";
import {
  checkIsDateAfter,
  getCurrentUnix,
} from "../../commons/common-functions";

// Add Participant to Tournament API with check for registration status and player existence
export const addParticipantsToEventHandler = async (req, res) => {
  try {
    await addParticipantValidation.validateAsync(req.body);
    const { tournamentId, eventId, playerIds, teamName } = req.body;

    // Check if tournament exists
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) {
      throw new CustomError(`Tournament not found with the provided ID`);
    }

    // Check if tournament registration is open
    const currentUnix = getCurrentUnix();
    if (!checkIsDateAfter(tournament.registrationEndDateTime, currentUnix)) {
      throw new CustomError(`Tournament registration is closed`);
    }

    // Check if event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new CustomError(`Event not found with the provided ID`);
    }

    // Check event type and validate playerIds
    let teamId = generatePublicId();
    switch (event.type) {
      case "solo":
        if (playerIds.length !== 1) {
          throw new CustomError(`For solo event, playerIds array should contain exactly 1 player`);
        }
        break;
      case "duo":
        if (playerIds.length !== 2) {
          throw new CustomError(`For duo event, playerIds array should contain exactly 2 players`);
        }
        break;
      default:
        throw new CustomError(`Unsupported event type`);
    }

    let isTeamNameExists = await ParticipantModel.findOne({eventId,teamName});
    
    if (isTeamNameExists){
      throw new CustomError(`Team Name Already Exists!`);
    }

    // Insert participants based on playerIds
    const participants = [];
    for (const playerId of playerIds) {
      const participantData = {
        hostId: req.session._id,
        teamId,
        teamName,
        tournamentId,
        eventId,
        playerId,
        created_at: getCurrentUnix(),
        updated_at: getCurrentUnix(),
      };
      participants.push(participantData);
    }
    await ParticipantModel.insertMany(participants);

    return res.status(StatusCodes.OK).send(
      responseGenerators({}, StatusCodes.OK, 'Participants added successfully', 0)
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).send(
        responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
      );
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
      responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Server Error', 1)
    );
  }
};


// API to select participants based on email or phone number and return playerId and player name
export const selectParticipantsHandler = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    let player;
    if (email) {
      player = await PlayerModel.findOne({ email });
    } else if (phoneNumber) {
      player = await PlayerModel.findOne({ phone: phoneNumber });
    }

    if (!player) {
      throw new CustomError(`Player not found with provided email or phone number`);
    }

    const participants = [{ playerId: player._id, playerName: player.name }];

    return res.status(StatusCodes.OK).send(
      responseGenerators(participants, StatusCodes.OK, 'Participants found successfully', 0)
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).send(
        responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
      );
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
      responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Server Error', 1)
    );
  }
};


/*export const addParticipantHandler = async (req, res) => {
  try {
    // validation
    await addParticipantValidation.validateAsync(req.body);

    const { tournamentId, playerId, teamId, eventId } = req.body;
    const hostId = req?.session?._id;

    // Check if registration is open
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) {
      throw new CustomError(`Invalid Tournament Id`);
    }

    // get register data
    const registrationEndUnix = +tournament.registrationEndDateTime;
    // get current unix timestamp
    const currentUnix = getCurrentUnix();

    if (!checkIsDateAfter(registrationEndUnix, currentUnix)) {
      throw new CustomError(`Tournament registration is closed`);
    }

    // Check if player exists
    let player;
    if (playerId) {
      player = await PlayerModel.findById(playerId);
    } else if (eventId) {
      player = await PlayerModel.findOne({ eventId });
    }
    if (!player) {
      throw new CustomError(`Invalid player ID or eventId`);
    }

    // Check if participant already exists in the tournament
    const existingParticipant = await ParticipantModel.findOne({
      tournamentId,
      playerId: player._id,
      hostId,
      teamId,
    });
    if (existingParticipant) {
      throw new CustomError(`Participant already exists in the tournament`);
    }

    // Create participant
    const participantData = {
      tournamentId,
      playerId: player._id,
      hostId,
      teamId,
      eventId,
      paymentStatus: 'PENDING',
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix() ,
    };
    const newParticipant = await ParticipantModel.create(participantData);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { _id: newParticipant._id },
        StatusCodes.OK,
        'Participant added successfully',
        0
      )
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).send(
        responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
      );
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
      responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Server Error', 1)
    );
  }
};*/
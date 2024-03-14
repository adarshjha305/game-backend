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
export const addParticipantHandler = async (req, res) => {
  try {
    // validation
    await addParticipantValidation.validateAsync(req.body);

    const { tournamentId, playerId, hostId, teamId } = req.body;

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
    const player = await PlayerModel.findById(playerId);
    if (!player) {
      throw new CustomError(`Invalid player ID`);
    }

    // Check if player already exists in the tournament
    const existingParticipant = await ParticipantModel.findOne({
      tournamentId,
      playerId,
      hostId,
      teamId,
    });
    if (existingParticipant) {
      throw new CustomError(`Participant already exists in the tournament`);
    }

    // Create participant
    const participantData = { ...req.body, paymentStatus: "PENDING" };
    const newParticipant = await ParticipantModel.create(participantData);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { _id: newParticipant._id },
          StatusCodes.OK,
          "Participant added successfully",
          0
        )
      );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerators(
          {},
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          1
        )
      );
  }
};

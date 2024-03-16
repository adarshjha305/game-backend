import { StatusCodes } from "http-status-codes";
import { getCurrentUnix } from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import {
  scoreUpdateMatchValidation,
  updateMatchValidation,
} from "../../helpers/validations/match.validation";
import BadmintonMatchModel from "../../models/badmintonMatch";

// update Match
export const updateMatchHandler = async (req, res) => {
  try {
    // check Validation
    await updateMatchValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    // find and update Match
    let updatedData = await BadmintonMatchModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...req.body,
        updated_at: getCurrentUnix(),
        updated_by: req.session.hostId,
      },
      { new: true }
    );

    // if the Match is not exist
    if (!updatedData) throw new CustomError(`Match does not exist`);

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(updatedData, StatusCodes.OK, "SUCCESS", 0));
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

// update score
export const scoreUpdateMatchHandler = async (req, res) => {
  try {
    // check Validation
    await scoreUpdateMatchValidation.validateAsync(req.body);

    // winner
    // tie

    // find and update score
    let updatedData = await BadmintonMatchModel.findOneAndUpdate(
      {
        _id: req.body.id,
        isDeleted: false,
        tournamentId: req.body.tournamentId,
        eventId: req.body.eventId,
        "score.type.0.teamId": req.body.score.type[0].teamId,
        "score.type.1.teamId": req.body.score.type[1].teamId,
      },
      {
        score: req.body.score,
        updated_at: getCurrentUnix(),
        updated_by: req.session.hostId,
      },
      { new: true }
    );

    // if the Match is not exist
    if (!updatedData) throw new CustomError(`Match does not exist`);

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(updatedData, StatusCodes.OK, "SUCCESS", 0));
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

export const getLiveScoreHandler = async (req, res) => {
  try {
    const { matchId, eventId, tournamentId } = req.body;

    // Ensure matchId and tournamentId are provided in the request body
    if (!matchId || !tournamentId || !eventId) {
      throw new CustomError(
        "Match ID or Tournament ID or Event ID are required"
      );
    }

    // Find the match based on tournamentId and matchId
    const match = await BadmintonMatchModel.findOne({
      _id: matchId,
      eventId: req.body.eventId,
      tournamentId: tournamentId,
      isDeleted: false,
    });

    // If match not found, throw error
    if (!match) {
      throw new CustomError("Match not found");
    }

    // Extract player information from the match
    const playerInfo = match.score.map((score) => {
      return {
        playerId: score.teamId,
        playerName: "Player Name",
        score: score.score,
      };
    });

    const responseData = {
      matchId: match._id,
      tournamentId: match.tournamentId,
      eventId: match.eventId,
      gameId: match.gameId,
      matchType: match.matchType,
      startDateAndTime: match.startDateAndTime,
      endDateAndTime: match.endDateAndTime,
      players: playerInfo,
    };

    // Send the response
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          responseData,
          StatusCodes.OK,
          "Live score fetched successfully",
          0
        )
      );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

/** map the file to get the single match object for database insertion */
const singleBadmintonMatchMapper = (
  singleMatch,
  tournamentId,
  eventId,
  hostId
) => {
  return {
    hostId: hostId,
    locationId: "",
  };
};

/** Add match participant */
export const AddBadmintonMatchWithParticipants = async (
  matchData,
  tournamentId,
  eventId,
  hostId
) => {
  let finalMatchArrayFromInsertion = [];
  for (const singleMatch of matchData) {
    finalMatchArrayFromInsertion.push(
      singleBadmintonMatchMapper({
        ...singleMatch,
        tournamentId,
        eventId,
        hostId,
      })
    );
  }
};

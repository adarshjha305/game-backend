import { StatusCodes } from "http-status-codes";
import {
  generatePublicId,
  getCurrentUnix,
  getMatchNameText,
} from "../../commons/common-functions";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import {
  scoreUpdateMatchValidation,
  startMatchValidation,
  updateMatchValidation,
} from "../../helpers/validations/match.validation";
import BadmintonMatchModel from "../../models/badmintonMatch";
import { CustomError } from "../../helpers/custome.error";

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
    await scoreUpdateMatchValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    // check Match exist
    let matchData = await BadmintonMatchModel.findOne({
      _id: req.params.id,
      isDeleted: false,
      tournamentId: req.body.tournamentId,
      eventId: req.body.eventId,
    });

    // if the Match is not exist
    if (!matchData) throw new CustomError(`Match does not exist.`);

    // check match is in progress
    if (matchData.status !== "IN_PROGRESS")
      throw new CustomError(
        `The match hasn't started yet or it's already over.`
      );

    // update score
    let updatedScore = [];
    for (const iterator of req.body.score) {
      let isTeamExist = matchData.score.filter(
        (ele) => ele.teamId === iterator.teamId
      );
      if (!isTeamExist)
        throw new CustomError("These players don't belong to this match.");
      updatedScore.push({
        teamId: isTeamExist[0].teamId,
        score: isTeamExist[0].score + iterator.score,
      });
    }

    matchData.score = updatedScore;
    matchData.updated_by = req.session._id;
    matchData.updated_at = getCurrentUnix();
    await matchData.save();

    // condition for winning
    // if the score is greter than max Point
    if (
      matchData.score[0].score >= matchData.maxPoints ||
      matchData.score[1].score >= matchData.maxPoints
    ) {
      // normal condition winning
      // One score is greater than or equal to the maximum point, and the other is two scores less.
      if (Math.abs(matchData.score[0].score - matchData.score[1].score) >= 2) {
        return res
          .status(StatusCodes.OK)
          .send(
            responseGenerators(
              { matchCompleted: true },
              StatusCodes.OK,
              "Match completed successfully",
              0
            )
          );
      }
      // here we apply the super point concept
      else if (
        matchData.score[0].score === 30 ||
        matchData.score[1].score === 30
      ) {
        return res
          .status(StatusCodes.OK)
          .send(
            responseGenerators(
              { matchCompleted: true },
              StatusCodes.OK,
              "Match completed successfully",
              0
            )
          );
      }
    }

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...matchData, matchCompleted: false },
          StatusCodes.OK,
          "Score Updated successfully",
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

// start match
export const startMatchHandler = async (req, res) => {
  try {
    // check Validation
    await startMatchValidation.validateAsync(req.body);

    // check match id
    let matchData = await BadmintonMatchModel.findOne({
      _id: req.body.matchId,
      hostId: req.session._id,
      isDeleted: false,
    });

    // check match exist or not
    if (!matchData) throw new CustomError("The match doesn't exist.");

    // check match status
    if (matchData.status !== "PENDING") {
      throw new CustomError(
        "You can't start a match because it's either completed or still ongoing."
      );
    }

    // check dependent match are over.
    if (matchData.dependentOnMatchResult.length) {
      // check for 1st winner in dependent match.
      const firstDependentMatch = matchData.dependentOnMatchResult[0];

      // check first Dependent Match Status
      const firstDependentMatchStatus = await BadmintonMatchModel.findOne({
        _id: firstDependentMatch,
        hostId: req.session._id,
        isDeleted: false,
      }).select("status name");

      // if not completed then return
      if (firstDependentMatchStatus !== "COMPLETED") {
        throw new CustomError(
          `You can't start this match because ${firstDependentMatchStatus.name} is not Completed`
        );
      }

      if (matchData.dependentOnMatchResult.length() > 1) {
        // check for 2nd winner in dependent match.
        const secondDependentMatchID = matchData.dependentOnMatchResult[1];

        // check first Dependent Match Status
        const secondDependentMatchData = await BadmintonMatchModel.findOne({
          _id: secondDependentMatchID,
          hostId: req.session._id,
          isDeleted: false,
        }).select("status name");

        // if not completed then return
        if (secondDependentMatchData !== "COMPLETED") {
          throw new CustomError(
            `You can't start this match because ${secondDependentMatchData.name} is not Completed`
          );
        }
      }
    }

    // update status  to in progress  and venueId && startDateAndTime make that time as current time
    matchData.status = "IN_PROGRESS";
    matchData.venueId = req.body.venueId;
    matchData.startDateAndTime = getCurrentUnix();
    (matchData.updated_by = req.session._id),
      (matchData.updated_at = getCurrentUnix());

    await matchData.save();
    // Send the response
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          matchData,
          StatusCodes.OK,
          "Match Start successfully",
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

/** Add match participant */
export const AddBadmintonMatchWithParticipants = async (
  matchData,
  tournamentId,
  eventId,
  hostId,
  gameId,
  eventData
) => {
  let finalMatchArrayFromInsertion = [];
  for (const singleMatch of matchData) {
    // check for dependant match
    let dependantMatchName = [];
    let dependantMatchIds = [];
    let dp1 = getMatchNameText(singleMatch.player1);
    if (dp1) dependantMatchName.push(dp1);
    let dp2 = getMatchNameText(singleMatch.player2);
    if (dp2) dependantMatchName.push(dp2);

    if (dependantMatchName.length) {
      // check in final array.
      dependantMatchIds = finalMatchArrayFromInsertion
        .filter((ele) => ele.name == dp1 || ele.name == dp2)
        .map((ele) => ele._id);
    }
    finalMatchArrayFromInsertion.push({
      _id: generatePublicId(),
      name: singleMatch.matchId,
      hostId: hostId,
      tournamentId: tournamentId,
      eventId: eventId,
      player1: singleMatch.player1,
      player2: singleMatch.player2,
      gameId: gameId,
      dependentOnMatchResult: dependantMatchIds,
      numOfSets: eventData.numOfSets,
      maxPoints: eventData.maxPoints,
      status: "PENDING",
      score: [
        {
          teamId: singleMatch.player1,
          score: 0,
        },
        {
          teamId: singleMatch.player2,
          score: 0,
        },
      ],
      matchType: eventData.type,
      venueId: eventData.venueId[0],
      gameType: eventData.gameType,
      round: singleMatch.round,
      startDateAndTime: singleMatch.matchStartTime,
      endDateAndTime: singleMatch.matchEndTime,
      created_by: hostId,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
      updated_by: hostId,
    });
  }
  await BadmintonMatchModel.insertMany(finalMatchArrayFromInsertion);
};

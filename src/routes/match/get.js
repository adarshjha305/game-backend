import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custom.error";
import { responseGenerators } from "../../lib/utils";
import MatchModel from "../../models/match";

export const listMatchesHandler = async (req, res) => {
  try {
    const tournamentId = req.params.id;

    // Find all matches based on the tournamentId
    const matches = await MatchModel.find({
      tournamentId: tournamentId,
      isDeleted: false,
    });

    const responseData = matches.map((match) => ({
      matchId: match._id,
      tournamentId: match.tournamentId,
      gameId: match.gameId,
      matchType: match.matchType,
      startDateAndTime: match.startDateAndTime,
      endDateAndTime: match.endDateAndTime,
      status: match.status,
    }));

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        responseData,
        StatusCodes.OK,
        "Matches fetched successfully",
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



// export const getLiveScoreHandler = async (req, res) => {
//   try {
//     const { tournamentId, matchId } = req.params;

//     // Find the match based on tournamentId and matchId
//     const match = await MatchModel.findOne({
//       _id: matchId,
//       tournamentId: tournamentId,
//       isDeleted: false,
//     });

//     // If match not found, throw error
//     if (!match) {
//       throw new CustomError("Match not found");
//     }

//     // Extract player information from the match
//     const playerInfo = match.score.map((score) => {
//       return {
//         playerId: score.teamId,
//         playerName: "Player Name", // You need to fetch player name based on playerId from your database
//         score: score.score,
//       };
//     });

//     // Prepare response data
//     const responseData = {
//       matchId: match._id,
//       tournamentId: match.tournamentId,
//       gameId: match.gameId,
//       matchType: match.matchType,
//       startDateAndTime: match.startDateAndTime,
//       endDateAndTime: match.endDateAndTime,
//       players: playerInfo,
//     };

//     // Send the response
//     return res.status(StatusCodes.OK).send(
//       responseGenerators(
//         responseData,
//         StatusCodes.OK,
//         "Live score fetched successfully",
//         0
//       )
//     );
//   } catch (error) {
//     console.error(error);
//     if (error instanceof CustomError) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         message: error.message,
//       });
//     }
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: "Internal Server Error",
//     });
//   }
// };

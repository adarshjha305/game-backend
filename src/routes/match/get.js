import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import BadmintonMatchModel from "../../models/badmintonMatch";
import { setPagination } from "../../commons/common-functions";

export const listMatchesHandler = async (req, res) => {
  try {
    const { id: tournamentId, eventId } = req.params;

    let where = {
      isDeleted: false,
    };

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    // Find all matches based on the tournamentId or eventId
    const matches = await BadmintonMatchModel.find(where);

    const responseData = matches.map((match) => ({
      matchId: match._id,
      tournamentId: match.tournamentId,
      gameId: match.gameId,
      matchType: match.matchType,
      startDateAndTime: match.startDateAndTime,
      endDateAndTime: match.endDateAndTime,
      status: match.status,
    }));

    return res
      .status(StatusCodes.OK)
      .send(
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

export const getLiveScoreListHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new CustomError("Host ID is required");
    }

    let where = {
      eventId: req.params.id,
      isDeleted: false,
      hostId: req.session._id,
    };

    const pagination = setPagination(req.query);

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $lookup: {
          from: "participants",
          localField: "score.0.teamId",
          foreignField: "_id",
          as: "matchParticipantDataTeam1",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                teamName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "participants",
          localField: "score.1.teamId",
          foreignField: "_id",
          as: "matchParticipantDataTeam2",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                teamName: 1,
              },
            },
          ],
        },
      },
      {
        $sort: pagination.sort,
      },
      {
        $skip: pagination.offset,
      },
      {
        $limit: pagination.limit,
      },
    ];

    const badmintonMatchData = await BadmintonMatchModel.aggregate(
      aggregationPipeline
    );

    if (!badmintonMatchData) throw new CustomError(`No Matches found.`);

    let total_count = await BadmintonMatchModel.count(where);

    // Send the response
    return res.status(StatusCodes.OK).send(
      responseGenerators(
        badmintonMatchData,
        {
          paginatedData: badmintonMatchData,
          totalCount: total_count,
          itemsPerPage: pagination.limit,
        },
        StatusCodes.OK,
        "Live score fetched successfully",
        0
      )
    );
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: error.message,
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

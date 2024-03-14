import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { setPagination } from "../../commons/common-functions";

// list tournament.
export const listTournamentsHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { name: new RegExp(req.query.search.toString(), "i") },
            { contactPerson: new RegExp(req.query.search.toString(), "i") },
            { contactPhone: new RegExp(req.query.search.toString(), "i") },
            { contactEmail: new RegExp(req.query.search.toString(), "i") },
          ],
        },
      };
    }
    const pagination = setPagination(req.query);

    const tournaments = await TournamentModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await TournamentModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: tournaments,
          totalCount: total_count,
          itemsPerPage: pagination.limit,
        },
        StatusCodes.OK,
        "SUCCESS",
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

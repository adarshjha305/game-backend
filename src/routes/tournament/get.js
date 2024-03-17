import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  dateToUnixForFilter,
  getUnixEndTime,
  getUnixStartTime,
  setPagination,
} from "../../commons/common-functions";

// list tournament.

export const listTournamentsHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query?.search) {
      where.$or = [
        { name: new RegExp(req.query.search.toString(), "i") },
        { contactPerson: new RegExp(req.query.search.toString(), "i") },
        { contactPhone: new RegExp(req.query.search.toString(), "i") },
        { contactEmail: new RegExp(req.query.search.toString(), "i") },
      ];
    }

    // Date-wise filtering

    if (req.query?.startDate && req.query?.endDate) {
      where.startDateAndTime = {
        $gte: getUnixStartTime(dateToUnixForFilter(req.query.startDate)),
        $lte: getUnixEndTime(dateToUnixForFilter(req.query.endDate)),
      };
    } else if (req.query?.startDate) {
      where.startDateAndTime = {
        $gte: getUnixStartTime(dateToUnixForFilter(req.query.startDate)),
      };
    } else if (req.query?.endDate) {
      where.endDateAndTime = {
        $lte: getUnixEndTime(dateToUnixForFilter(req.query.endDate)),
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

export const deleteTournamentHandler = async (req, res) => {
  try {
    if (!req.params.id) throw new CustomError(`Please provide valid id`);

    // find and update Event
    let updatedData = await TournamentModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, updatedAt: getCurrentUnix(), updatedBy: "" },
      { new: true }
    );

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators({}, StatusCodes.OK, "SUCCESS", 0));
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

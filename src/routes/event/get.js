import { StatusCodes } from "http-status-codes";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import EventModel from "../../models/events";

// list Event
export const listEventHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    // search as hostId
    if (req.query?.hostId) {
      where = {
        ...where,
        hostId: req.query.hostId,
      };
    }
    // search as locationId
    if (req.query?.locationId) {
      where = {
        ...where,
        locationId: req.query.locationId,
      };
    }
    // search as gameId
    if (req.query?.gameId) {
      where = {
        ...where,
        gameId: req.query.gameId,
      };
    }
    // search as tournamentId
    if (req.query?.tournamentId) {
      where = {
        ...where,
        tournamentId: req.query.tournamentId,
      };
    }
    // search as status
    if (req.query?.status) {
      where = {
        ...where,
        status: req.query.status,
      };
    }
    // search as gameType
    if (req.query?.gameType) {
      where = {
        ...where,
        gameType: req.query.gameType,
      };
    }

    const pagination = setPagination(req.query);

    const events = await EventModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await EventModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: events,
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

// delete Event
export const deleteEventHandler = async (req, res) => {
  try {
    // check Validation
    if (!req.params.id) throw new CustomError(`Please provide valid id`);

    // find and update Event
    let updatedData = await EventModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, updatedAt: getCurrentUnix(), updatedBy: "" },
      { new: true }
    );

    // if the location is not exist
    if (!updatedData) throw new CustomError(`Location does not exist`);

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

// single Event
export const singleEventHandler = async (req, res) => {
  try {
    if (!req?.params?.id) throw new CustomError(`Please provide plan ID.`);

    let EventData = await EventModel.findOne({
      hostId: req.session.hostId,
      isDeleted: false,
      _id: req.params.id,
    });

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(EventData, StatusCodes.OK, "SUCCESS", 0));
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

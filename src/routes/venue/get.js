import { StatusCodes } from "http-status-codes";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import VenueModel from "../../models/venue";

// list Venue
export const listVenueHandler = async (req, res) => {
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

    const pagination = setPagination(req.query);

    const venues = await VenueModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await VenueModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: venues,
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

// delete Venue
export const deleteVenueHandler = async (req, res) => {
  try {
    // check Validation
    if (!req.params.id) throw new CustomError(`Please provide valid id`);

    // find and update Venue
    let updatedData = await VenueModel.findOneAndUpdate(
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

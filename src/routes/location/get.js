import { StatusCodes } from "http-status-codes";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import LocationModel from "../../models/location";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";

// list location
export const listLocationsHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { line1: new RegExp(req.query.search.toString(), "i") },
            { line2: new RegExp(req.query.search.toString(), "i") },
            { city: new RegExp(req.query.search.toString(), "i") },
            { state: new RegExp(req.query.search.toString(), "i") },
            { country: new RegExp(req.query.search.toString(), "i") },
            { pinCode: new RegExp(req.query.search.toString(), "i") },
          ],
        },
      };
    }

    if (req.query?.hostId) {
      where = {
        ...where,
        hostId: req.query.hostId,
      };
    }

    const pagination = setPagination(req.query);

    const locations = await LocationModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await LocationModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: locations,
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

// delete location
export const deleteLocationHandler = async (req, res) => {
  try {
    // check Validation
    if (!req.params.id) throw new CustomError(`Please provide valid id`);

    // find and update location
    let updatedData = await LocationModel.findOneAndUpdate(
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

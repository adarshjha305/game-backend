import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import { getCurrentUnix } from "../../commons/common-functions";
import {
  createVenueValidation,
  updateVenueValidation,
} from "../../helpers/validations/venue.validation";
import VenueModel from "../../models/venue";

// create Venue
export const createVenueHandler = async (req, res) => {
  try {
    // check Validation
    await createVenueValidation.validateAsync(req.body);

    // Create a new Venue
    let newVenue = await VenueModel.create({
      ...req.body,
      created_by: req.body.hostId,
      updated_by: req.body.hostId,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(newVenue, StatusCodes.OK, "SUCCESS", 0));
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

// update Venue
export const updateVenueHandler = async (req, res) => {
  try {
    // check Validation
    await updateVenueValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    // find and update Venue
    let updatedData = await VenueModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...req.body,
        updated_at: getCurrentUnix(),
        updated_by: req.body.hostId,
      },
      { new: true }
    );

    // if the Venue  is not exist
    if (!updatedData) throw new CustomError(`Location does not exist`);

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

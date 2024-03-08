import { StatusCodes } from "http-status-codes";
import {
  createLocationValidation,
  updateLocationValidation,
} from "../../helpers/validations/location.validation";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import { getCurrentUnix } from "../../commons/common-functions";
import LocationModel from "../../models/location";

// create location
export const createLocationHandler = async (req, res) => {
  try {
    // check Validation
    await createLocationValidation.validateAsync(req.body);

    // Create a new location
    let newLocation = await LocationModel.create({
      ...req.body,
      created_by: req.body.hostId,
      updated_by: req.body.hostId,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(newLocation, StatusCodes.OK, "SUCCESS", 0));
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

// update location
export const updateLocationHandler = async (req, res) => {
  try {
    // check Validation
    await updateLocationValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    // find and update location
    let updatedData = await LocationModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...req.body,
        updated_at: getCurrentUnix(),
        updated_by: req.body.hostId,
      },
      { new: true }
    );

    // if the location is not exist
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

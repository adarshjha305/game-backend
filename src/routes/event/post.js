import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import { getCurrentUnix } from "../../commons/common-functions";
import EventModel from "../../models/events";
import {
  createEventValidation,
  updateEventValidation,
} from "../../helpers/validations/event.validation";

// create Event
export const createEventHandler = async (req, res) => {
  try {
    // check Validation
    await createEventValidation.validateAsync(req.body);

    // Create a new event
    let newVenue = await EventModel.create({
      ...req.body,
      created_by: req.session.hostId,
      updated_by: req.session.hostId,
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

// update Event
export const updateEventHandler = async (req, res) => {
  try {
    // check Validation
    await updateEventValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    // find and update Event
    let updatedData = await EventModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...req.body,
        updated_at: getCurrentUnix(),
        updated_by: req.body.hostId,
      },
      { new: true }
    );

    // if the Event  is not exist
    if (!updatedData) throw new CustomError(`Event does not exist`);

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

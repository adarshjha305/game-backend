import { StatusCodes } from "http-status-codes";
import { getCurrentUnix } from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import {
  scoreUpdateMatchValidation,
  updateMatchValidation,
} from "../../helpers/validations/match.validation";
import MatchModel from "../../models/match";

// update Match
export const updateMatchHandler = async (req, res) => {
  try {
    // check Validation
    await updateMatchValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    // find and update Match
    let updatedData = await MatchModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        ...req.body,
        updated_at: getCurrentUnix(),
        updated_by: req.session.hostId,
      },
      { new: true }
    );

    // if the Match is not exist
    if (!updatedData) throw new CustomError(`Match does not exist`);

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

// update score
export const scoreUpdateMatchHandler = async (req, res) => {
  try {
    // check Validation
    await scoreUpdateMatchValidation.validateAsync(req.body);

    // find and update score
    let updatedData = await MatchModel.findOneAndUpdate(
      {
        _id: req.body.id,
        isDeleted: false,
        tournamentId: req.body.tournamentId,
        "score.type.0.teamId": req.body.score.type[0].teamId,
        "score.type.1.teamId": req.body.score.type[1].teamId,
      },
      {
        score: req.body.score,
        updated_at: getCurrentUnix(),
        updated_by: req.session.hostId,
      },
      { new: true }
    );

    // if the Match is not exist
    if (!updatedData) throw new CustomError(`Match does not exist`);

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

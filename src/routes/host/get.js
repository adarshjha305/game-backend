import { ValidationError } from "joi";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import HostModel from "../../models/host";



export const listHostHandler = async (req, res) => {
    try {
        let where = { isDeleted: false };

        let updatedData = await HostModel.find(where);
  
      return res
      .status(StatusCodes.OK)
      .send(responseGenerators(updatedData, StatusCodes.OK, "SUCCESS", 0));
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
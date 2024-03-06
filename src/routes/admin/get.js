import { StatusCodes } from "http-status-codes";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import AdminModel from "../../models/admin";
import { responseGenerators } from "../../lib/utils";

export const listAdminHandler = async (req, res) => {
  try {
    const where = { isDeleted: false };

    const admins = await AdminModel.find(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(admins, StatusCodes.OK, "SUCCESS", 0)
    );
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

export const infoAdminHandler = async (req, res) => {
  try {
    const adminId = req.params.id;
    if (!adminId) throw new CustomError(`Please provide valid id`);

    const admin = await AdminModel.findOne(
      { _id: adminId, isDeleted: false },
      { password: 0 }
    ).lean();

    if (!admin) throw new CustomError(`Admin doesn't exist`);

    return res.status(StatusCodes.OK).send(
      responseGenerators(admin, StatusCodes.OK, "SUCCESS", 0)
    );
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

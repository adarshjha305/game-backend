import { ValidationError } from "joi";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import HostModel from "../../models/host";
import { setPagination } from "../../commons/common-functions";

export const listHostHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query.search) {
      const searchQuery = req.query.search.toString();
      where.$or = [
        { fname: new RegExp(searchQuery, "i") },
        { lname: new RegExp(searchQuery, "i") },
        { phoneNumber: new RegExp(searchQuery, "i") },
        { email: new RegExp(searchQuery, "i") },
      ];
    }

    const pagination = setPagination(req.query);

    const hosts = await HostModel.find(where)
      .select("-password")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean();

    return res.status(StatusCodes.OK).send(
      responseGenerators(hosts, StatusCodes.OK, "SUCCESS", 0)
    );

  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).send(
        responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
      );
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
      responseGenerators(
        {},
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        1
      )
    );
  }
};
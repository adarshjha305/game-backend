import { ValidationError } from "joi";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import { setPagination } from "../../commons/common-functions";
import PlayerModel from "../../models/player";


// LIST PLAYER API
export const listPlayerHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { fname: new RegExp(req.query.search.toString(), "i") },
            { lname: new RegExp(req.query.search.toString(), "i") },
            { phoneNumber: new RegExp(req.query.search.toString(), "i") },
            { email: new RegExp(req.query.search.toString(), "i") },
          ],
        },
      };
    }
    const pagination = setPagination(req.query);

    const hosts = await PlayerModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    let total_count = await PlayerModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: hosts,
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

//DELETE PLAYER API
export const deletePlayer = async (req, res) => {
    try {
      const { id: _id } = req.params;
      const player = await PlayerModel.findOne({ _id, isDeleted: false });
  
      if (!player) throw new CustomError(`This Player could not be found.`);
  
      player.isDeleted = true;
  
      await player.save();
  
      return res
        .status(StatusCodes.OK)
        .send(responseGenerators({}, StatusCodes.OK, "SUCCESS", 0));
    } catch (error) {
      if (error instanceof ValidationError || error instanceof CustomError) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
          );
      }
      console.log(JSON.stringify(error));
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
  

  
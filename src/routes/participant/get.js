
import { ValidationError } from "joi";
import ParticipantModel from "../../models/participant";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { CustomError } from "../../helpers/custome.error";
import { setPagination } from "../../commons/common-functions";

//List Participant API

export const listParticipantHandler = async (req, res) => {
    try {
        let where = { isDeleted: false , paymentStatus: "COMPLETED" };
    
        if (req.query?.search) {
          where = {
            ...where,
            ...{
              $or: [
                { hostId: new RegExp(req.query.search.toString(), "i") },
                { teamId: new RegExp(req.query.search.toString(), "i") },
                { playerId: new RegExp(req.query.search.toString(), "i") },
                { tournamentId: new RegExp(req.query.search.toString(), "i") },
              ],
            },
          };
        }
        const pagination = setPagination(req.query);
    
        const participants = await ParticipantModel.find(where)
          .sort(pagination.sort)
          .skip(pagination.offset)
          .limit(pagination.limit)
          .lean()
          .exec();
    
        let total_count = await ParticipantModel.countDocuments(where);
    
        return res.status(StatusCodes.OK).send(
          responseGenerators(
            {
              paginatedData: participants,
              totalCount: total_count,
              itemsPerPage: pagination.limit,
            },
            StatusCodes.OK,
            "SUCCESS",
            0
          )
        );
      }  
    catch (error) {
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


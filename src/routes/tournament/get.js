import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { setPagination } from "../../commons/common-functions";




export const listTournamentsHandler = async (req, res) => {
    try {
        let where = { isDeleted: false };

        if (req.query?.search) {
            where = {
              ...where,
              ...{
                $or: [
                  { name: new RegExp(req.query.search.toString(), "i") },
                  { gameType: new RegExp(req.query.search.toString(), "i") },
                  { type: new RegExp(req.query.search.toString(), "i") },
                  { contactPerson: new RegExp(req.query.search.toString(), "i") },
                  { contactPhone: new RegExp(req.query.search.toString(), "i") },
                  { contactEmail: new RegExp(req.query.search.toString(), "i") },
                  { venueId: new RegExp(req.query.search.toString(), "i") },
                  { gameId: new RegExp(req.query.search.toString(), "i") },
                  { locationId: new RegExp(req.query.search.toString(), "i") },
                  { hostId: new RegExp(req.query.search.toString(), "i") },
                ],
              },
            };
          }
          const pagination = setPagination(req.query);
      
          const tournaments = await TournamentModel.find(where)
            .select("-password")
            .sort(pagination.sort)
            .skip(pagination.offset)
            .limit(pagination.limit)
            .lean()
            .exec();
      
          return res
            .status(StatusCodes.OK)
            .send(responseGenerators(tournaments, StatusCodes.OK, "SUCCESS", 0));
  

        } catch (error) {
            if (error instanceof ValidationError || error instanceof CustomError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: error.message,
            });
            }
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Internal Server Error',
            });
        }
  }
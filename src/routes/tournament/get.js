import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { setPagination } from "../../commons/common-functions";



// list tournament.
export const listTournamentsHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { name: new RegExp(req.query.search.toString(), "i") },
            { contactPerson: new RegExp(req.query.search.toString(), "i") },
            { contactPhone: new RegExp(req.query.search.toString(), "i") },
            { contactEmail: new RegExp(req.query.search.toString(), "i") },
          ],
        },
      };
    }

    // Check if both startDate and endDate are provided
    if (req.query?.startDate && req.query?.endDate) {
      where.startDate = {
        $gte: new Date(req.query.startDate), 
      };
      where.endDate = {
        $lte: new Date(req.query.endDate), 
      };
      // Only startDate is provided
    } else if (req.query?.startDate) { 
      where.startDate = {
        // Matches tournaments starting on or after the provided start date
        $gte: new Date(req.query.startDate), 
      };
    } else if (req.query?.endDate) { 
      where.endDate = {
        // Matches tournaments ending on or before the provided end date
        $lte: new Date(req.query.endDate), 
      };
    }

    const pagination = setPagination(req.query);

    const tournaments = await TournamentModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await TournamentModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: tournaments,
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


/*export const listTournamentsHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query?.search) {
      const searchQuery = req.query.search.toString().trim();
      const dateRegex = /(\d{4}-\d{2}-\d{2})/g; // Regex to match YYYY-MM-DD format dates
      const dateMatches = searchQuery.match(dateRegex);

      if (dateMatches && dateMatches.length === 1) {
        // If one date value is found, assume it represents either start date or end date
        const [dateValue] = dateMatches;
        const isStartDate = searchQuery.indexOf(dateValue) < searchQuery.indexOf(dateMatches[0]);
        
        if (isStartDate) {
          // If the date value comes before the other text in the query, treat it as start date
          where.startDate = { $gte: new Date(dateValue) };
        } else {
          // Otherwise, treat it as end date
          where.endDate = { $lte: new Date(dateValue) };
        }

        // Remove date value from the search query
        const updatedSearchQuery = searchQuery.replace(dateRegex, '').trim();

        // Add remaining search terms to $or array
        where.$or = [
          { name: new RegExp(updatedSearchQuery, "i") },
          { contactPerson: new RegExp(updatedSearchQuery, "i") },
          { contactPhone: new RegExp(updatedSearchQuery, "i") },
          { contactEmail: new RegExp(updatedSearchQuery, "i") },
        ];
      } else if (dateMatches && dateMatches.length === 2) {
        // If two date values are found, treat them as start date and end date respectively
        const [startDate, endDate] = dateMatches;
        where.startDate = { $gte: new Date(startDate) };
        where.endDate = { $lte: new Date(endDate) };
      } else {
        // If no or more than two date values are found, perform regular search
        where = {
          ...where,
          ...{
            $or: [
              { name: new RegExp(searchQuery, "i") },
              { contactPerson: new RegExp(searchQuery, "i") },
              { contactPhone: new RegExp(searchQuery, "i") },
              { contactEmail: new RegExp(searchQuery, "i") },
            ],
          },
        };
      }
    }

    const pagination = setPagination(req.query);

    const tournaments = await TournamentModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await TournamentModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: tournaments,
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
*/
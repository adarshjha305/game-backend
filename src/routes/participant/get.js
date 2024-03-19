import { ValidationError } from "joi";
import ParticipantModel from "../../models/participant";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { CustomError } from "../../helpers/custome.error";
import { setPagination } from "../../commons/common-functions";

//List Participant API
export const listParticipantHandler = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      throw new CustomError("Event ID is required");
    }

    const where = {
      eventId: eventId,
      isDeleted: false,
      paymentStatus: "COMPLETED",
    };

    const pagination = setPagination(where);

    const participants = await ParticipantModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const totalCount = await ParticipantModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: participants,
          totalCount,
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

// export const listParticipantHandler = async (req, res) => {
//   try {
//     const tournamentId = req.params.id;

//     if (!tournamentId) {
//       throw new CustomError("Tournament ID is required");
//     }

//     const where = {
//       tournamentId,
//       isDeleted: false,
//       paymentStatus: "COMPLETED",
//     };

//     const pagination = setPagination(where);

//     const participants = await ParticipantModel.find(where)
//       .sort(pagination.sort)
//       .skip(pagination.offset)
//       .limit(pagination.limit)
//       .lean()
//       .exec();

//     const totalCount = await ParticipantModel.countDocuments(where);

//     return res.status(StatusCodes.OK).send(
//       responseGenerators(
//         {
//           paginatedData: participants,
//           totalCount,
//           itemsPerPage: pagination.limit,
//         },
//         StatusCodes.OK,
//         "SUCCESS",
//         0
//       )
//     );
//   } catch (error) {
//     if (error instanceof ValidationError || error instanceof CustomError) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .send(
//           responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
//         );
//     }
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .send(
//         responseGenerators(
//           {},
//           StatusCodes.INTERNAL_SERVER_ERROR,
//           "Internal Server Error",
//           1
//         )
//       );
//   }
// };

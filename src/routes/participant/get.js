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

// Select participants based on event ID and return Team Name and participant ID
export const selectParticipantsByEventIdHandler = async (req, res) => {
  try {
    const eventId = req.params.id;

    const participants = await ParticipantModel.aggregate([
      {
        $match: { eventId }, // Filter participants based on the event ID
      },
      {
        $project: {
          _id: 1, // Include participant ID
          teamName: 1, // Include teamName
          playerId: 1, // Include playerId
        },
      },
    ]);

    // Check if participants exist
    if (!participants || participants.length === 0) {
      throw new CustomError(`No participants found for the given event ID`);
    }

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          participants,
          StatusCodes.OK,
          "Participants found successfully",
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
    console.error(error);
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

// API to Toggle isOpen in Participant Model
export const toggleParticipantIsOpenHandler = async (req, res) => {
  try {
    const participantId = req.params._id;

    // Find the participant by ID
    const participant = await ParticipantModel.findById(participantId);
    if (!participant) {
      throw new CustomError(`Participant not found with the provided ID`);
    }
    participant.isOpen = true;

    await participant.save();

    return res.status(StatusCodes.OK).send({
      data: participant,
      message: "Participant isOpen field toggled to true successfully",
      errorCode: 0,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        data: {},
        message: error.message,
        errorCode: 1,
      });
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      data: {},
      message: "Internal Server Error",
      errorCode: 1,
    });
  }
};

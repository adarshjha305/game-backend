import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  tournamentBadmintonFixingValidation,
  tournamentValidation,
} from "../../helpers/validations/tournament.validation";
import {
  dateToUnixForFilter,
  generateTheMatchScheduleForKnockOut,
  getCurrentUnix,
  generateTheMatchBadmintonScheduleForKnockOut,
  provideDateToBadmintonMatchScheduled,
} from "../../commons/common-functions";
import ParticipantModel from "../../models/participant";
import EventModel from "../../models/events";
import { AddBadmintonMatchWithParticipants } from "../match/post";

// create tournament.
export const createTournamentHandler = async (req, res) => {
  try {
    await tournamentValidation.validateAsync(req.body);

    // Retrieve hostId from session
    const hostId = req?.session?._id;

    // Ensure hostId is available
    if (!hostId) {
      throw new CustomError("HostId not found in session");
    }

    const existingTournament = await TournamentModel.findOne({
      name: req.body.name,
      isDeleted: false,
    });

    if (existingTournament) {
      throw new CustomError(
        `Tournament with name '${req.body.name}' already exists`
      );
    }

    const newTournament = await TournamentModel.create({
      hostId: hostId,
      gameId: req.body.gameId,
      name: req.body.name,
      description: req.body.description,
      sponsors: [],
      startDateAndTime: dateToUnixForFilter(req.body.startDateAndTime),
      registrationEndDateTime: dateToUnixForFilter(
        req.body.registrationEndDateTime
      ),
      banner: req.body.banner,
      contactPerson: req.body.contactPerson,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      created_by: hostId,
      created_at: getCurrentUnix(),
      paymentStatus: "PENDING",
      updated_by: hostId,
      updated_at: getCurrentUnix(),
    });

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { _id: newTournament._id },
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

/** Create feature  for the tournament */
export const createBadmintonFixtureHandler = async (req, res) => {
  try {
    /** validation  */
    await tournamentBadmintonFixingValidation.validateAsync(req.body);

    /** Check exist */
    const existingTournament = await TournamentModel.findOne({
      _id: req.body.tournamentId,
      isDeleted: false,
    });

    /** If exist */
    if (!existingTournament) {
      throw new CustomError(`Tournament not found.`);
    }

    /**  get the event  */
    let eventData = await EventModel.findOne({
      _id: req.body.eventId,
      isDeleted: false,
    });

    if (!eventData) throw new CustomError(`Event  not found.`);

    if (eventData.fixtureCreated)
      throw new CustomError(`Fixture already created`);

    /** Create the fixture */
    if (eventData.gameType == "KNOCK_OUT") {
      /** Create fixture for   gameType = KNOCK_OUT */
      /** get the participants */
      let participantsData = await ParticipantModel.find({
        eventId: req.body.eventId,
      });

      if (!participantsData)
        throw new CustomError(`No participants found for tournament`);

      /** Check min participants count  */
      if (
        eventData.minParticipants &&
        participantsData.length < +eventData.minParticipants
      )
        throw new CustomError(
          `participants count is less than  required for fixtures`
        );

      /** generate the team */
      let teamIds = (await participantsData).map((ele) => ele.teamId);

      /** Generate matches fixture */
      let { fullMatches } = generateTheMatchBadmintonScheduleForKnockOut(
        teamIds.length,
        teamIds
      );

      /** Generate the dates for the scheduled matches */
      fullMatches = await provideDateToBadmintonMatchScheduled(
        fullMatches,
        req.body.tournamentId,
        req.body.eventId
      );

      await AddBadmintonMatchWithParticipants(
        fullMatches,
        req.body.tournamentId,
        req.body.eventId,
        req.session._id,
        "wvkk-fizw8e-sMcv8CYxnelxZnoWZ4gi0mgLkradgh1710560703843",
        eventData
      );

      await EventModel.findOneAndUpdate(
        {
          _id: req.body.eventId,
          isDeleted: false,
        },
        {
          fixtureCreated: true,
          updated_at: getCurrentUnix(),
          updated_by: req.session._id,
        }
      );

      return res
        .status(StatusCodes.OK)
        .send(responseGenerators(null, StatusCodes.OK, "SUCCESS", 0));
    } else {
      throw new CustomError(`Please provide the valid game type`);
    }
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

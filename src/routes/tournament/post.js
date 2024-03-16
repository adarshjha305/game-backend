import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  tournamentFixingValidation,
  tournamentValidation,
} from "../../helpers/validations/tournament.validation";
import {
  dateToUnix,
  generateTheMatchScheduleForKnockOut,
  getCurrentUnix,
} from "../../commons/common-functions";
import ParticipantModel from "../../models/participant";

// create tournament.
export const createTournamentHandler = async (req, res) => {
  try {
    await tournamentValidation.validateAsync(req.body);
    
    // Retrieve hostId from session
    const hostId = req?.session?._id;

    // Ensure hostId is available
    if (!hostId) {
      throw new CustomError('HostId not found in session');
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
      startDateAndTime: dateToUnix(req.body.startDateAndTime),
      registrationEndDateTime: dateToUnix(req.body.registrationEndDateTime),
      banner: req.body.banner,
      contactPerson: req.body.contactPerson,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      created_by: hostId,
      created_at: getCurrentUnix(),
    });

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { _id: newTournament._id },
        StatusCodes.OK,
        'SUCCESS',
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
      message: 'Internal Server Error',
    });
  }
};


/** Create feature  for the tournament */
export const createFixtureHandler = async (req, res) => {
  try {
    /** validation  */
    await tournamentFixingValidation.validateAsync(req.params);

    /** Check exist */
    const existingTournament = await TournamentModel.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    /** If exist */
    if (!existingTournament) {
      throw new CustomError(`Tournament not found.`);
    }

    if (existingTournament.fixtureCreated) {
      throw new CustomError(`Tournament already fixed.`);
    }

    /** Create the fixture */
    if (existingTournament.gameType == "KNOCK_OUT") {
      /** Create fixture for   gameType = KNOCK_OUT */
      /** get the participants */
      let participantsData = ParticipantModel.find({
        tournamentId: req.params.id,
      });

      if (!participantsData)
        throw new CustomError(`No participants found for tournament`);

      /** Check min participants count  */
      if (
        existingTournament.minParticipants &&
        participantsData.length < +existingTournament.minParticipants
      )
        throw new CustomError(
          `participants count is less than  required for fixtures`
        );

      /** generate the team */
      let teamIds = (await participantsData).map((ele) => ele.teamId);

      /** Generate matches fixture */
      let { rounds, fullMatches } = generateTheMatchScheduleForKnockOut(
        teamIds.length,
        teamIds
      );

      /** Generate each round */
      for (const iterator of fullMatches) {
      }
    } else {
      throw new CustomError(`Please provide the valid game type`);
    }

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(null, StatusCodes.OK, "SUCCESS", 0));
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

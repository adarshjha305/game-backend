import { ValidationError } from "joi";
import TournamentModel from "../../models/tournament";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { tournamentValidation } from "../../helpers/validations/tournament.validation";
import { dateToUnix } from "../../commons/common-functions";



export const createTournamentHandler = async (req, res) => {
    try {   
    await  tournamentValidation.validateAsync(req.body);
      const existingTournament = await TournamentModel.findOne({ name: req.body.name });

      if (existingTournament) {
        throw new CustomError(`Tournament with name '${req.body.name}' already exists`);
      }
  
      const newTournament = await TournamentModel.create({
        hostId: req.body.hostId,
        locationId: req.body.locationId,
        gameId: req.body.gameId,
        numOfSets: req.body.numOfSets || 3,
        maxPoints: req.body.maxPoints || 21,
        venueId: req.body.venueId || [],
        name: req.body.name,
        description: req.body.description,
        gameType: req.body.gameType,
        type: req.body.type,
        startDateAndTime: dateToUnix(req.body.startDateAndTime),
        endDateAndTime: dateToUnix(req.body.endDateAndTime),
        maxParticipants: req.body.maxParticipants,
        minParticipants: req.body.minParticipants,
        registrationEndDateTime: dateToUnix(req.body.registrationEndDateTime),
        gender: req.body.gender,
        banner: req.body.banner,
        minAge: req.body.minAge,
        maxAge: req.body.maxAge,
        tournamentFee: req.body.tournamentFee,
        contactPerson: req.body.contactPerson,
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail,
      });
  
      return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ _id: newTournament._id}, StatusCodes.OK, "SUCCESS", 0)
      );
    }catch (error) {
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



// export const addTournament = async (req, res) => {
//     try {
//         console.log("Add Message Script Started");
//         let newTournament = [
//                 {
//                   hostId: "host123",
//                   locationId: "location456",
//                   gameId: "game789",
//                   venueId: ["venue1", "venue2"],
//                   name: "Summer Smash Tournament",
//                   description: "Join us for an exciting summer tournament!",
//                   gameType: "KNOCK_OUT",
//                   type: "SOLO",
//                   startDateAndTime: "2024-07-01T09:00:00Z",
//                   endDateAndTime: "2024-07-03T18:00:00Z",
//                   maxParticipants: 100,
//                   minParticipants: 20,
//                   registrationEndDateTime: "2024-06-25T23:59:59Z",
//                   gender: "ALL",
//                   banner: "https://example.com/summer-smash-banner.jpg",
//                   minAge: "18",
//                   maxAge: "40",
//                   tournamentFee: 50.00,
//                   contactPerson: "John Doe",
//                   contactPhone: "+1234567890",
//                   contactEmail: "john.doe@example.com"
//                 },
//                 {
//                   hostId: "host456",
//                   locationId: "location789",
//                   gameId: "game123",
//                   venueId: ["venue3"],
//                   name: "Winter Blitz Tournament",
//                   description: "Get ready for a frosty showdown!",
//                   gameType: "ROUND_ROBIN",
//                   type: "DUO",
//                   startDateAndTime: "2024-12-01T10:00:00Z",
//                   endDateAndTime: "2024-12-03T20:00:00Z",
//                   maxParticipants: 50,
//                   minParticipants: 10,
//                   registrationEndDateTime: "2024-11-25T23:59:59Z",
//                   gender: "MALE",
//                   banner: "https://example.com/winter-blitz-banner.jpg",
//                   minAge: "20",
//                   maxAge: "50",
//                   tournamentFee: 75.00,
//                   contactPerson: "Jane Smith",
//                   contactPhone: "+1987654321",
//                   contactEmail: "jane.smith@example.com"
//                 }
//         ];

//         await TournamentModel.insertMany(newTournament);

//         console.log("Add Tournament Script Completed");
//         res.status(200).json({ message: "Tournament added successfully" });
//     } catch (error) {
//         if (error instanceof ValidationError || error instanceof CustomError) {
//             return res
//                 .status(StatusCodes.BAD_REQUEST)
//                 .send(
//                     responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
//                 );
//         }
//         console.log(JSON.stringify(error));
//         return res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .send(
//                 responseGenerators(
//                     {},
//                     StatusCodes.INTERNAL_SERVER_ERROR,
//                     "Internal Server Error",
//                     1
//                 )
//             );
//     }
// };
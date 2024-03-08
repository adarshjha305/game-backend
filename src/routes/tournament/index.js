import express from "express";
import { createTournamentHandler } from "./post";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { listTournamentsHandler } from "./get";

const tournamentRouter = express.Router();


tournamentRouter.post(
    "/create",
    privateKeyMiddleware,
    createTournamentHandler
  );


tournamentRouter.get(
    "/list",
    privateKeyMiddleware,
    listTournamentsHandler
  );
  
// tournamentRouter.post(
//     "/add-tournament",
//     privateKeyMiddleware,
//     addTournament
//   );


  export default tournamentRouter;
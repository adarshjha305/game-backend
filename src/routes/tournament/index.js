import express from "express";
import { createFixtureHandler, createTournamentHandler } from "./post";
import { listTournamentsHandler } from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const tournamentRouter = express.Router();

tournamentRouter.post("/create", authenticateHost, createTournamentHandler);

tournamentRouter.get("/list", authenticateHost, listTournamentsHandler);

tournamentRouter.post(
  "/create-fixture/:tournamentId/:eventId",
  authenticateHost,
  createFixtureHandler
);

// tournamentRouter.post(
//     "/add-tournament",
//     privateKeyMiddleware,
//     addTournament
//   );

export default tournamentRouter;

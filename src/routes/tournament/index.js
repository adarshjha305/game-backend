import express from "express";
import { createBadmintonFixtureHandler, createTournamentHandler } from "./post";
import { listTournamentsHandler } from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const tournamentRouter = express.Router();

tournamentRouter.post("/create", authenticateHost, createTournamentHandler);

tournamentRouter.get("/list", authenticateHost, listTournamentsHandler);

tournamentRouter.post(
  "/create-badminton-fixture/:tournamentId/:eventId",
  authenticateHost,
  createBadmintonFixtureHandler
);

// tournamentRouter.post(
//     "/add-tournament",
//     privateKeyMiddleware,
//     addTournament
//   );

export default tournamentRouter;

import express from "express";
import { createFixtureHandler, createTournamentHandler } from "./post";
import { listTournamentsHandler } from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const tournamentRouter = express.Router();

// Create Tournament
tournamentRouter.post("/create", authenticateHost, createTournamentHandler);

// List Tournament
tournamentRouter.get("/list", authenticateHost, listTournamentsHandler);

// Create Fixture/Scheduling For Tournament
tournamentRouter.post(
  "/create-fixture/:tournamentId/:eventId",
  authenticateHost,
  createFixtureHandler
);

export default tournamentRouter;

import express from "express";
import {
  createBadmintonFixtureHandler,
  createFixtureHandler,
  createTournamentHandler,
} from "./post";
import { deleteTournamentHandler, listTournamentsHandler } from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const tournamentRouter = express.Router();

// Create Tournament
tournamentRouter.post("/create", authenticateHost, createTournamentHandler);

// List Tournament
tournamentRouter.get("/list", authenticateHost, listTournamentsHandler);

// Delete Tournament
tournamentRouter.get("/delete/:id", authenticateHost, deleteTournamentHandler);

// Create Fixture/Scheduling For Tournament
tournamentRouter.post(
  "/create-badminton-fixture",
  authenticateHost,
  createBadmintonFixtureHandler
);

export default tournamentRouter;

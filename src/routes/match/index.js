import express from "express";
import { authenticateHost } from "../../middleware/hostAuthentication";
import { listMatchesHandler } from "./get";
import {
  getLiveScoreHandler,
  scoreUpdateMatchHandler,
  startMatchHandler,
  updateMatchHandler,
} from "./post";

const badmintonMatchRouter = express.Router();

// update match
badmintonMatchRouter.post("/update/:id", authenticateHost, updateMatchHandler);

// update score
badmintonMatchRouter.post(
  "/score-update/:id",
  authenticateHost,
  scoreUpdateMatchHandler
);

// Get Live Score
badmintonMatchRouter.post("/live-score", authenticateHost, getLiveScoreHandler);

// List Matches
badmintonMatchRouter.get("/list/:id", authenticateHost, listMatchesHandler);

// start Matches
badmintonMatchRouter.post("/start-match", authenticateHost, startMatchHandler);

export default badmintonMatchRouter;

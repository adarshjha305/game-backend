import express from "express";
import { authenticateHost } from "../../middleware/hostAuthentication";
import { getLiveScoreListHandler, listMatchesHandler } from "./get";
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

// get live score
badmintonMatchRouter.get(
  "/get-live-score/:id",
  authenticateHost,
  getLiveScoreListHandler
);

// start Matches
badmintonMatchRouter.post("/start-match", authenticateHost, startMatchHandler);

export default badmintonMatchRouter;

import express from "express";
import { authenticateHost } from "../../middleware/hostAuthentication";
import { listMatchesHandler } from "./get";
import {
  getLiveScoreHandler,
  scoreUpdateMatchHandler,
  startMatchHandler,
  updateMatchHandler,
} from "./post";

const matchRouter = express.Router();

// update match
matchRouter.post("/update/:id", authenticateHost, updateMatchHandler);

// update score
matchRouter.post(
  "/score-update/:id",
  authenticateHost,
  scoreUpdateMatchHandler
);

// Get Live Score
matchRouter.post("/live-score", authenticateHost, getLiveScoreHandler);

// List Matches
matchRouter.get("/list/:id", authenticateHost, listMatchesHandler);

// start Matches
matchRouter.post("/start-matches", authenticateHost, startMatchHandler);

export default matchRouter;

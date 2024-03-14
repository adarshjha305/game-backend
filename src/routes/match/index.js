import express from "express";
import { authenticateHost } from "../../middleware/hostAuthentication";
import { listMatchesHandler } from "./get";
import { getLiveScoreHandler, scoreUpdateMatchHandler, updateMatchHandler } from "./post";

const matchRouter = express.Router();

// update match
matchRouter.post("/update/:id", authenticateHost, updateMatchHandler);

// update score
matchRouter.post(
  "/score-update/:id",
  authenticateHost,
  scoreUpdateMatchHandler
);

matchRouter.post(
  "/live-score",
  authenticateHost,
  getLiveScoreHandler
);

matchRouter.get(
  "/list/:id",
  authenticateHost,
  listMatchesHandler
);

export default matchRouter;

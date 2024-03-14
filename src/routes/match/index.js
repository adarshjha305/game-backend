import express from "express";
import { authenticateHost } from "../../middleware/hostAuthentication";
import { scoreUpdateMatchHandler, updateMatchHandler } from "./post";

const matchRouter = express.Router();

// update match
matchRouter.post("/update/:id", authenticateHost, updateMatchHandler);

// update score
matchRouter.post(
  "/score-update/:id",
  authenticateHost,
  scoreUpdateMatchHandler
);

export default matchRouter;

import { Router } from "express";
import {
  addParticipantHandler,
  addParticipantsToEventHandler,
  selectParticipantsHandler,
} from "./post";
import {
  listParticipantHandler,
  selectParticipantsByEventIdHandler,
  toggleParticipantIsOpenHandler,
} from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const participantRouter = Router();

// // Add participants
// participantRouter.post(`/add`, authenticateHost, addParticipantHandler);

// Add participants
participantRouter.post(`/add`, authenticateHost, addParticipantsToEventHandler);

// Select participants based on email or phone number.
participantRouter.post(
  `/participants-PH-EM`,
  authenticateHost,
  selectParticipantsHandler
);

// Select participants based on event ID
participantRouter.get(
  `/participants-EV/:id`,
  authenticateHost,
  selectParticipantsByEventIdHandler
);

// List participants
participantRouter.get(`/list/:id`, authenticateHost, listParticipantHandler);

// Toggle isOpen participant
participantRouter.get(
  `/isOpen/:id`,
  authenticateHost,
  toggleParticipantIsOpenHandler
);

export default participantRouter;

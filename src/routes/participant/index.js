import { Router } from "express";
import { addParticipantHandler, addParticipantsToEventHandler, selectParticipantsHandler } from "./post";
import { listParticipantHandler, selectParticipantsByEventIdHandler } from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const participantRouter = Router();

// // Add participants
// participantRouter.post(`/add`, authenticateHost, addParticipantHandler);

// Add participants
participantRouter.post(`/add`, authenticateHost, addParticipantsToEventHandler);

// Select participants based on email or phone number. 
participantRouter.post(`/select-participants`, authenticateHost, selectParticipantsHandler);

// Select participants based on email or phone number. 
participantRouter.get(`/select-participants`, authenticateHost, selectParticipantsByEventIdHandler);

// List participants
participantRouter.get(
  `/list/:id`,
  authenticateHost,
  listParticipantHandler
);

export default participantRouter;

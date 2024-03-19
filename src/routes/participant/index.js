import { Router } from "express";
import { addParticipantHandler } from "./post";
import { listParticipantHandler } from "./get";
import { authenticateHost } from "../../middleware/hostAuthentication";

const participantRouter = Router();

// Add participants
participantRouter.post(`/add`, authenticateHost, addParticipantHandler);

// List participants
participantRouter.get(`/list/:id`, authenticateHost, listParticipantHandler);

export default participantRouter;

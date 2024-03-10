import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { addParticipantHandler } from "./post";
import { listParticipantHandler } from "./get";



const participantRouter = Router();

participantRouter.post(`/add`, privateKeyMiddleware, addParticipantHandler);

participantRouter.get(`/list`, privateKeyMiddleware, listParticipantHandler);


export default participantRouter;

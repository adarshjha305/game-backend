import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { createPlayerHandler, otpVerificationHandler, toggleBlockUnblockHandler, updatePlayerHandler } from "./post";
import { deletePlayer, listPlayerHandler } from "./get";



const playerRouter = Router();

playerRouter.post(`/create`, privateKeyMiddleware, createPlayerHandler);

playerRouter.post(`/otp-verification`, privateKeyMiddleware, otpVerificationHandler);

playerRouter.get(`/list`, privateKeyMiddleware, listPlayerHandler);

playerRouter.get(`/delete/:id`, privateKeyMiddleware, deletePlayer);

playerRouter.post(`/update/:id`, privateKeyMiddleware, updatePlayerHandler);

playerRouter.post("/toggle-block-unblock/:id",privateKeyMiddleware, toggleBlockUnblockHandler);


export default playerRouter;

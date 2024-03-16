import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { createPlayerHandler, otpVerificationHandler, toggleBlockUnblockHandler, updatePlayerHandler } from "./post";
import { deletePlayer, listPlayerHandler } from "./get";



const playerRouter = Router();

// Create Player
playerRouter.post(`/create`, privateKeyMiddleware, createPlayerHandler);

// OTP Verification
playerRouter.post(`/otp-verification`, privateKeyMiddleware, otpVerificationHandler);

// List Players
playerRouter.get(`/list`, privateKeyMiddleware, listPlayerHandler);

// Delete Player
playerRouter.get(`/delete/:id`, privateKeyMiddleware, deletePlayer);

// Update Player
playerRouter.post(`/update/:id`, privateKeyMiddleware, updatePlayerHandler);

// Block/Unblock Player
playerRouter.post("/toggle-block-unblock/:id",privateKeyMiddleware, toggleBlockUnblockHandler);


export default playerRouter;

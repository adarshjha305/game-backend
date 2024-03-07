import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { listHostHandler } from "./get";
import { createHostHandler, otpVerificationHandler, toggleBlockUnblockHandler } from "./post";

const hostRoute = Router();

hostRoute.post(`/create`, privateKeyMiddleware, createHostHandler);

hostRoute.post(
  `/otp-verification`,
  privateKeyMiddleware,
  otpVerificationHandler
);

hostRoute.get(`/list`, privateKeyMiddleware, listHostHandler);

hostRoute.post(
  "/toggle-block-unblock/:id",
  toggleBlockUnblockHandler
);

export default hostRoute;

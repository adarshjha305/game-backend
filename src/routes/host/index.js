import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";

import {
  createHostHandler,
  loginHostHandler,
  otpVerificationHandler,
  toggleBlockUnblockHandler
} from "./post";

import { listHostHandler } from "./get";


const hostRoute = Router();

hostRoute.post(`/create`, privateKeyMiddleware, createHostHandler);

hostRoute.post(
  `/otp-verification`,
  privateKeyMiddleware,
  otpVerificationHandler
);


hostRoute.post(`/login`, privateKeyMiddleware, loginHostHandler);

hostRoute.get(`/list`, privateKeyMiddleware, listHostHandler);

hostRoute.post(
  "/toggle-block-unblock/:id",
  toggleBlockUnblockHandler
);

export default hostRoute;

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

// Create Host
hostRoute.post(`/create`, privateKeyMiddleware, createHostHandler);

// OTP Verification
hostRoute.post(
  `/otp-verification`,
  privateKeyMiddleware,
  otpVerificationHandler
);

// Login Host
hostRoute.post(`/login`, privateKeyMiddleware, loginHostHandler);

// List HOST
hostRoute.get(`/list`, privateKeyMiddleware, listHostHandler);

// Block/Unblock Host
hostRoute.post(
  "/toggle-block-unblock/:id",
  toggleBlockUnblockHandler
);

export default hostRoute;

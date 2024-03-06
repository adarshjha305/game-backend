import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { createHostHandler, otpVerificationHandler } from "./post";

const hostRoute = Router();

hostRoute.post(`/create`, privateKeyMiddleware, createHostHandler);
hostRoute.post(
  `/otp-verification`,
  privateKeyMiddleware,
  otpVerificationHandler
);
export default hostRoute;

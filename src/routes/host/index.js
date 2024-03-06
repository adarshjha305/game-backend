import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import {
  createHostHandler,
  loginHostHandler,
  otpVerificationHandler,
} from "./post";

const hostRoute = Router();

hostRoute.post(`/create`, privateKeyMiddleware, createHostHandler);
hostRoute.post(
  `/otp-verification`,
  privateKeyMiddleware,
  otpVerificationHandler
);

hostRoute.post(`/login`, privateKeyMiddleware, loginHostHandler);
export default hostRoute;

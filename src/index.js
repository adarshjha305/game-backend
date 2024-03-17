/* eslint-disable no-case-declarations */
import * as bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import http from "http";
import { StatusCodes } from "http-status-codes";
import logger from "./lib/logger";
import { responseValidation } from "./lib/utils";
import adminRoute from "./routes/admin";
import hostRoute from "./routes/host";
import tournamentRouter from "./routes/tournament";
import playerRouter from "./routes/player";
import locationRouter from "./routes/location";
import venueRouter from "./routes/venue";
import participantRouter from "./routes/participant";
import eventRouter from "./routes/event";
import { getCurrentDate } from "./commons/common-functions";
import configVariables from "../config";
// import { generateTheMatchScheduleForKnockOut } from "./commons/common-functions";
// import { generateTheMatchSchedule } from "./scripts";

// let playerArray = [
//   "player1",
//   "player2",
//   "player3",
//   "player4",
//   "player5",
//   "player6",
//   "player7",
//   "player8",
//   "player9",
//   "player10",
//   "player11",
//   "player12",
//   "player13",
//   "player14",
//   "player15",
//   "player16",
//   "player17",
//   "player18",
//   "player19",
//   "player20",
//   "player21",
// ];

// console.log(
//   JSON.stringify(
//     generateTheMatchScheduleForKnockOut(playerArray.length, playerArray)
//   )
// );

// Math.pow(2, Math.floor(Math.log(players) / Math.log(2)))

const app = express();
const server = new http.Server(app);

// eslint-disable-next-line no-undef
// if (process.env.NODE_ENV !== "development") {
// eslint-disable-next-line no-undef
//     app.use(cors({ origin: [config.FRONT_END_URL] }));
// } else {
app.use(cors({ origin: "*" }));
// }

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many request hit from this IP, please try again after 5 min.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);
app.use(helmet());

app.use((req, res, next) => {
  try {
    // set header for swagger.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self';"
    );
    logger.info(
      `------------ API Info ------------
      IMP - API called path: ${req.path},
      method: ${req.method},
      query: ${JSON.stringify(req.query)},
      remote address (main/proxy ip):,
      reference: ${req.headers.referer} ,
      user-agent: ${req.headers["user-agent"]}
      ------------ End ------------  `
    );
  } catch (error) {
    logger.error(`error while printing caller info path: ${req.path}`);
  }
  next();
});

const health = async (req, res) => {
  try {
    res.json({
      message: "We are ready to serve the Sportigig API's",
      env: configVariables.ENV,
      dates: getCurrentDate(),
    });
  } catch (error) {
    console.log(error);
  }
};

app.get("/", health);
app.use("/api/admin", adminRoute);
app.use("/api/host", hostRoute);
app.use("/api/tournament", tournamentRouter);
app.use("/api/player", playerRouter);
app.use("/api/location", locationRouter);
app.use("/api/venue", venueRouter);
app.use("/api/participant", participantRouter);
app.use("/api/event", eventRouter);

app.use(express.json());

app.use((req, res) => {
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(
      responseValidation(StatusCodes.INTERNAL_SERVER_ERROR, "No route found")
    );
});

app.use((error, req, res) => {
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(
      responseValidation(
        StatusCodes.INTERNAL_SERVER_ERROR,
        process.env.NODE_ENV === "development" ? error.message : {}
      )
    );
});

export default server;

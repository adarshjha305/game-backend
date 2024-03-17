import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { nanoid } from "nanoid";
import { totp } from "otplib";
import configVariables from "../../config";
import EventModel from "../models/events";

const key = configVariables.ENCRYPT_SECRET;
const keyBuffer = Buffer.from(key, "hex");

const salt = bcrypt.genSaltSync(10);

require("dotenv").config();
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(configVariables.TIMEZONE);
let time_zone = configVariables.TIMEZONE;

export const checkMatchEndTimeInTheSameDay = (
  matchEndTime,
  currentTime,
  dayEndTime
) => {
  matchEndTime = dayjs.unix(matchEndTime).tz(time_zone);
  currentTime =
    dayjs.unix(currentTime).tz(time_zone).format("YYYY-MM-DD").toString() +
    " " +
    dayEndTime;

  currentTime = dayjs(currentTime);

  return matchEndTime.isAfter(matchEndTime);
};

export const checkForToday = (unixData) => {
  const currentDate = dayjs.unix(unixData).tz(time_zone);
  const today = dayjs().tz(time_zone).startOf("day");
  return currentDate.isSame(today, "day");
};

export const addMonthsCurrentUnix = (currentUnix, months) => {
  return dayjs
    .unix(currentUnix)
    .tz(time_zone)
    .add(+months, "months")
    .unix()
    .toString();
};

export const addDaysCurrentUnix = (currentUnix, days) => {
  return dayjs
    .unix(currentUnix)
    .tz(time_zone)
    .add(+days, "days")
    .unix()
    .toString();
};

export const getCurrentEndTime = () => {
  return dayjs().tz(time_zone).endOf("day").unix().toString();
};

export const getCurrentStartTime = () => {
  return dayjs().tz(time_zone).startOf("day").unix().toString();
};

export const add10MinToUnxi = (currentUnix) => {
  return dayjs
    .unix(currentUnix)
    .tz(time_zone)
    .add(10, "minutes")
    .unix()
    .toString();
};

export const addMinsToUnxi = (currentUnix, mins) => {
  return dayjs
    .unix(currentUnix)
    .tz(time_zone)
    .add(+mins, "minutes")
    .unix()
    .toString();
};

export const checkIsDateAfter = (
  date1,
  date2 = dayjs().tz(time_zone).unix()
) => {
  return dayjs
    .unix(+date1)
    .tz(time_zone)
    .isAfter(dayjs.unix(+date2).tz(time_zone));
};

export const getMonthStartData = () => {
  let tData = dayjs().tz(time_zone);
  const startOfMonth = tData.startOf("month");
  return startOfMonth.unix().toString();
};

export const add7DayToUnxi = (currentUnix) => {
  return dayjs.unix(currentUnix).tz(time_zone).add(7, "days").unix().toString();
};

export const getCurrentUnix = () => {
  return dayjs().tz(time_zone).unix().toString(); //generate the unix
};

export const generatePublicId = () => {
  return nanoid() + nanoid() + Date.now();
};

export const hashPassword = async (password) => {
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateSecret = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateTOTP = (secret, purpose) => {
  const step = 30;
  const digits = 6;
  const algorithm = "sha1";
  const window = 600;

  totp.options = {
    digits: digits,
    step: step,
    window: window,
    algorithm: algorithm,
  };
  totp.options = {
    digits: digits,
    step: step,
    window: window,
    algorithm: algorithm,
  };
  const code = totp.generate(secret);
  const expiresAt = add10MinToUnxi(getCurrentUnix());
  const newOtpSecret = {
    secret,
    purpose,
    createdAt: new Date(),
    expiresAt,
  };

  return { code, newOtpSecret };
};

export const verifyTotp = (secret, code) => {
  const step = 30;
  const digits = 6;
  const algorithm = "sha1";
  const window = 600;

  totp.options = {
    digits: digits,
    step: step,
    window: window,
    algorithm: algorithm,
  };

  const isValid = totp.check(code, secret);
  return isValid;
};

export const generateApiKey = (length = 32) => {
  const buffer = crypto.randomBytes(length);
  return buffer.toString("base64");
};

export const generateUniqueKey = (length = 24) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

export const generatePassword = async () => {
  return new Promise((resolve) => {
    const length = 8; // Length of the generated password
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    resolve(password);
  });
};

export const setPagination = (options) => {
  const sort = {};
  if (options.sort_column) {
    const sortColumn = options.sort_column;
    const order =
      (options && options.sort_order === "1") ||
      (options && options.sort_order == "asc")
        ? 1
        : -1;
    sort[sortColumn] = order;
  } else {
    sort.created_at = -1;
  }

  const limit = +options?.limit ? +options?.limit : 10;
  const offset =
    ((+options.offset ? +options.offset : 1) - 1) * (+limit ? +limit : 10);
  return { sort, offset, limit };
};

export const encryptData = (text) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    keyBuffer,
    Buffer.from(configVariables.IV, "hex")
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decryptData = (encryptedText) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    keyBuffer,
    Buffer.from(configVariables.IV, "hex")
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const getUnixEndTime = (unixData) => {
  return dayjs
    .unix(unixData)
    .tz(time_zone)
    .endOf("day")
    .unix(unixData)
    .toString();
};

export const dateToUnixForFilter = (dateString) => {
  return dayjs.tz(dateString, time_zone).unix().toString();
};

export const getUnixStartTime = (unixData) => {
  return dayjs
    .unix(unixData)
    .tz(time_zone)
    .startOf("day")
    .unix(unixData)
    .toString();
};

export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const shuffleArray = (array) => {
  return array.slice().sort(() => Math.random() - 0.5);
};

export const createGroups = (array) => {
  const totalLength = array.length;
  const groupSize1 = 5;
  const groupSize2 = 4;

  let remainingLength = totalLength;
  const result = [];

  while (remainingLength > 0) {
    if (remainingLength % groupSize1 === 0) {
      result.push(array.splice(0, groupSize1));
      remainingLength -= groupSize1;
    } else if (remainingLength % groupSize2 === 0) {
      result.push(array.splice(0, groupSize2));
      remainingLength -= groupSize2;
    } else {
      // If neither group size evenly divides the remaining length, adjust the group size
      if (remainingLength % groupSize1 > remainingLength % groupSize2) {
        result.push(array.splice(0, groupSize1));
        remainingLength -= groupSize1;
      } else {
        result.push(array.splice(0, groupSize2));
        remainingLength -= groupSize2;
      }
    }
  }

  return result;
};

export const flatten = (arr) => {
  return arr.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
    []
  );
};

export const generateTheMatchBadmintonScheduleForKnockOut = (
  playerCount,
  playerArray
) => {
  let fullMatches = []; // total match round wise
  let preRoundPlayer;
  let firstByePlayers;
  let secondRoundNoMatchPlayers = [];
  let roundMatchesResult = [];

  playerArray = shuffleArray(playerArray);
  //1. Get rounds with pre-round
  const nextBracketSize = Math.pow(
    2,
    Math.ceil(Math.log(playerCount) / Math.log(2))
  );

  let firsRoundBye = nextBracketSize - playerCount;
  let preRoundCount = playerCount - firsRoundBye;
  let previousBracketSize = Math.pow(
    2,
    Math.floor(Math.log(playerCount) / Math.log(2))
  );

  firstByePlayers = playerArray.splice(0, firsRoundBye);

  // get no of rounds.
  let rounds =
    preRoundCount > 0
      ? 1 + Math.log(previousBracketSize) / Math.log(2)
      : 0 + Math.log(previousBracketSize) / Math.log(2);

  let matchId = 1;
  for (let i = 0; i < rounds; i++) {
    if (i == 0) {
      let currentRoundMatches = [];
      preRoundPlayer = playerArray.slice(0, preRoundCount);
      for (let index = 0; index < preRoundPlayer.length / 2; index++) {
        // pre-round
        currentRoundMatches.push({
          matchId: "Match " + matchId,
          player1: preRoundPlayer[index],
          player2: preRoundPlayer[preRoundPlayer.length - 1 - index],
          winner: `Winner for Match ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }

      roundMatchesResult.push(currentRoundMatches);
      fullMatches.push(currentRoundMatches);
    } else if (firstByePlayers.length) {
      let currentRoundMatches = [];
      if (firstByePlayers.length % 2 !== 0) {
        // Remove one element to make the array even
        secondRoundNoMatchPlayers = firstByePlayers.splice(
          Math.floor(firstByePlayers.length / 2),
          1
        );
      } else {
        // Output the original array if it's already even
        console.log("Array is already even:", firstByePlayers);
      }

      for (let index = 0; index < firstByePlayers.length / 2; index++) {
        // pre-round
        currentRoundMatches.push({
          matchId: "Match " + matchId,
          player1: firstByePlayers[index],
          player2: firstByePlayers[firstByePlayers.length - 1 - index],
          winner: `Winner for Match ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }
      firstByePlayers = [];

      // pre-round winner with remaining match for second round.
      let preRoundWinnerPlayer = [
        ...roundMatchesResult[i - 1],
        ...secondRoundNoMatchPlayers,
      ];

      for (let index = 0; index < preRoundWinnerPlayer.length / 2; index++) {
        // pre-round
        currentRoundMatches.push({
          matchId: "Match " + matchId,
          player1:
            typeof preRoundWinnerPlayer[index] == "string"
              ? preRoundWinnerPlayer[index]
              : preRoundWinnerPlayer[index].winner,
          player2:
            typeof preRoundWinnerPlayer[
              preRoundWinnerPlayer.length - 1 - index
            ] == "string"
              ? preRoundWinnerPlayer[preRoundWinnerPlayer.length - 1 - index]
              : preRoundWinnerPlayer[preRoundWinnerPlayer.length - 1 - index]
                  .winner,

          winner: `Winner for Match ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }

      roundMatchesResult.push(currentRoundMatches);
      fullMatches.push(currentRoundMatches);
    } else {
      let currentRoundMatches = [];
      for (
        let index = 0;
        index < roundMatchesResult[i - 1].length / 2;
        index++
      ) {
        currentRoundMatches.push({
          matchId: "Match " + matchId,
          player1:
            typeof roundMatchesResult[i - 1][index] == "string"
              ? roundMatchesResult[i - 1][index]
              : roundMatchesResult[i - 1][index].winner,
          player2:
            typeof roundMatchesResult[i - 1][
              roundMatchesResult[i - 1].length - 1 - index
            ] == "string"
              ? roundMatchesResult[i - 1][
                  roundMatchesResult[i - 1].length - 1 - index
                ]
              : roundMatchesResult[i - 1][
                  roundMatchesResult[i - 1].length - 1 - index
                ].winner,

          winner: `Winner for Match ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }
      roundMatchesResult.push(currentRoundMatches);
      fullMatches.push(currentRoundMatches);
    }
  }

  return {
    rounds: rounds,
    fullMatches: fullMatches,
  };
};

/** Use to add the date for each match based on event configurations */
export const provideDateToBadmintonMatchScheduled = async (
  finalMatches,
  tournamentId,
  eventId
) => {
  /** Get all matches in single array */
  finalMatches = flatten(finalMatches);

  /** get the event configurations */
  let eventsData = await EventModel.findOne({
    _id: eventId,
    tournamentId: tournamentId,
    isDeleted: false,
  });

  let currentTime = +eventsData.startDateAndTime;

  let scheduleMatch = [];
  /** Loop to add dates and time for each match */
  for (let i = 0; i < finalMatches.length; i++) {
    const matchStartTime = currentTime;
    const matchEndTime = addMinsToUnxi(
      +matchStartTime,
      +eventsData.perMatchMaxTime
    );

    // Check if match end time exceeds day end time
    if (
      checkMatchEndTimeInTheSameDay(
        matchEndTime,
        currentTime,
        eventsData.dayEndTime
      )
    ) {
      // If exceeds, reset current time to next day's start time
      currentTime = currentTime
        .add(1, "day")
        .tz(time_zone)
        .startOf("day")
        .add(EventModel.dayStartTime.split(":")[0], "hour")
        .add(EventModel.dayStartTime.split(":")[1], "minute");
    }

    scheduleMatch.push({ ...finalMatches[i], matchStartTime, matchEndTime });

    // Update current time for next match with rest time
    currentTime = addMinsToUnxi(+matchEndTime, +eventsData.perMatchRestTime);
  }

  return scheduleMatch;
};

export const getCurrentDate = () => {
  const now = dayjs();
  return {
    date: now.format().toString(),
    tz: dayjs.tz.guess(),
    offset: dayjs().tz(time_zone).format(),
    checkForToday: checkForToday(getCurrentUnix()),
    dateToUnixForFilter: dateToUnixForFilter("2024-03-17"),
    addMonthsCurrentUnix: addMonthsCurrentUnix(getCurrentUnix(), 1),
    addDaysCurrentUnix: addDaysCurrentUnix(getCurrentUnix(), 1),
    getUnixStartTime: getUnixStartTime(getCurrentUnix()),
    getUnixEndTime: getUnixEndTime(getCurrentUnix()),
    getCurrentEndTime: getCurrentEndTime(),
    getCurrentStartTime: getCurrentStartTime(),
    add10MinToUnxi: add10MinToUnxi(getCurrentUnix()),
  };
};

export const getMatchNameText = (inputString) => {
  const match = inputString.match(/Match \d+/);
  const matchString = match ? match[0] : null;
  return matchString;
};

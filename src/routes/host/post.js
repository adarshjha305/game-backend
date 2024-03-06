import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import { StatusCodes } from "http-status-codes";
import {
  createHostValidation,
  otpVerificationValidation,
} from "../../helpers/validations/host.validation";
import HostModel from "../../models/host";
import {
  encryptData,
  generateSecret,
  generateTOTP,
  getCurrentUnix,
  verifyTotp,
} from "../../commons/common-functions";
import { getJwt } from "../../helpers/Jwt.helper";
import { HOST, OTP } from "../../commons/global-constants";

// create host
export const createHostHandler = async (req, res) => {
  try {
    // validation
    await createHostValidation.validateAsync(req.body);

    //check user exits with given email or phone number
    let isAvailable = await HostModel.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
      isDeleted: false,
    });

    if (isAvailable)
      throw new CustomError(`Host Already exists with either email or phone`);

    // create host
    let newHost = await HostModel.create({
      ...req.body,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });
    // generate otp
    const secret = generateSecret();
    const purpose = "SIGNUP";
    const { code, newOtpSecret } = generateTOTP(secret, purpose);
    newHost.otpSecret.push(newOtpSecret);
    await newHost.save();
    console.log(`SIGNUP  EMAIL:- ` + req.body.email + ` OTP :- ` + code);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { _id: newHost._id, loginCompleted: false },
          StatusCodes.OK,
          "OTP Send Successfully",
          0
        )
      );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
    console.log(JSON.stringify(error));
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerators(
          {},
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          1
        )
      );
  }
};

// otp verification host
export const otpVerificationHandler = async (req, res) => {
  try {
    // validation
    await otpVerificationValidation.validateAsync(req.body);

    //check user exits with given email or phone number
    let isAvailable = await HostModel.findOne({
      _id: req.body.id,
      isDeleted: false,
    });

    if (!isAvailable) throw new CustomError(`Host not found.`);

    const purpose = "SIGNUP";
    let otpSecret = isAvailable.otpSecret.filter((e) => e.purpose == purpose);

    if (!otpSecret || !otpSecret.length)
      throw new CustomError("No pending OTP found for customer.");

    let isValid = verifyTotp(otpSecret.reverse()[0].secret, req.body.otp);
    if (isValid) {
      await HostModel.findOneAndUpdate(
        { _id: isAvailable._id },
        {
          otpSecret: [],
          isVerified: true,
          updated_at: getCurrentUnix(),
        }
      );
      return res
        .status(StatusCodes.OK)
        .send(
          responseGenerators(null, StatusCodes.OK, HOST.ONBOARD_MESSAGE, 0)
        );
      // welcome email.
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators(
            null,
            StatusCodes.BAD_REQUEST,
            OTP.INVALID_OTP,
            true
          )
        );
    }
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
    console.log(JSON.stringify(error));
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerators(
          {},
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          1
        )
      );
  }
};

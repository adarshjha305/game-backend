import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import { StatusCodes } from "http-status-codes";
import {
  createHostValidation,
  loginVerificationValidation,
  otpVerificationValidation,
} from "../../helpers/validations/host.validation";
import HostModel from "../../models/host";
import {
  comparePassword,
  generateSecret,
  generateTOTP,
  getCurrentUnix,
  hashPassword,
  verifyTotp,
} from "../../commons/common-functions";
import { HOST, OTP } from "../../commons/global-constants";
import { getJwt } from "../../helpers/Jwt.helper";

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
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      created_by: req.body._id,
      updated_by: req.body._id,
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

// login host
export const loginHostHandler = async (req, res) => {
  try {
    // validation
    await loginVerificationValidation.validateAsync(req.body);

    // find data using email or isDeleted
    let loginData = await HostModel.findOne({
      email: req.body.email.toLowerCase(),
      isDeleted: false,
    });

    // check the Host not exist or not
    if (!loginData) throw new CustomError(`Host Not Found!`);

    // check email is Verified or not
    if (loginData?.isVerified == false)
      throw new CustomError(`Please Verify your email!`);

    // check host is Blocked
    if (loginData?.isBlocked)
      throw new CustomError(
        `Host blocked. Contact admin for login assistance.`
      );

    // compare Password
    const isPasswordMatched = await comparePassword(
      req.body.password,
      loginData.password
    );

    // if Password is not correct
    if (!isPasswordMatched)
      throw new CustomError(`Incorrect Email or Password!`);

    // delete the password
    delete loginData.password;

    loginData.lastLogin = getCurrentUnix();
    loginData.updated_at = getCurrentUnix();
    loginData.save();

    // generate the jwt Token
    const jswToken = await getJwt({ loginData });

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { token: jswToken, userData: loginData, loginCompleted: true },
          StatusCodes.OK,
          "SUCCESS",
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

export const toggleBlockUnblockHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) throw new CustomError("Please provide a valid ID");

    if (status == undefined) throw new CustomError("Invalid status provided");

    const host = await HostModel.findById(id);
    if (!host) {
      throw new CustomError("Host not found");
    }

    const newStatus = status ? true : false;

    // Toggle isBlocked field based on new status
    const updatedHost = await HostModel.findByIdAndUpdate(
      id,
      { isBlocked: newStatus },
      { new: true }
    );

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ host: updatedHost }, StatusCodes.OK, "SUCCESS", 0)
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

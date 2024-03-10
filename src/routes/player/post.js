import { StatusCodes } from "http-status-codes";
import { generateSecret, generateTOTP, getCurrentUnix, verifyTotp } from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import { createPlayerValidation, playerOtpVerificationValidation, updatePlayerValidation } from "../../helpers/validations/player.validation";
import PlayerModel from "../../models/player";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { HOST, OTP } from "../../commons/global-constants";



// Create Player API
export const createPlayerHandler = async (req, res) => {
  try {

    await createPlayerValidation.validateAsync(req.body);

    // Check if player exists with given email or phone number
    let isAvailable = await PlayerModel.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
      isDeleted: false,
    });

    if (isAvailable) {
      // Check if user is verified, if yes, player already exists
      if (isAvailable.isVerified)
        throw new CustomError(`Player already exists with either email or phone`);

      // If not verified, delete the existing player
      await PlayerModel.deleteOne({
        _id: isAvailable._id,
      });
    }

    // Create player
    let newPlayer = await PlayerModel.create({
      ...req.body,
      email: req.body.email.toLowerCase(),
      created_by: req.body._id,
      updated_by: req.body._id,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    // Generate OTP
    const secret = generateSecret();
    const purpose = "SIGNUP";
    const { code, newOtpSecret } = generateTOTP(secret, purpose);
    newPlayer.otpSecret.push(newOtpSecret);
    await newPlayer.save();

    // Log OTP
    console.log(`SIGNUP  EMAIL:- ` + req.body.email + ` OTP :- ` + code);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { _id: newPlayer._id, loginCompleted: false },
        StatusCodes.OK,
        "OTP sent successfully",
        0
      )
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).send(
        responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
      );
    }
    console.log(JSON.stringify(error));
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
      responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", 1)
    );
  }
};

//OTP-Verification API
export const otpVerificationHandler = async (req, res) => {
    try {
      // validation
      await playerOtpVerificationValidation.validateAsync(req.body);
  
      //check user exits with given email or phone number
      let isAvailable = await PlayerModel.findOne({
        _id: req.body.id,
        isDeleted: false,
      });
  
      if (!isAvailable) throw new CustomError(`Player not found.`);
  
      const purpose = "SIGNUP";
      let otpSecret = isAvailable.otpSecret.filter((e) => e.purpose == purpose);
  
      if (!otpSecret || !otpSecret.length)
        throw new CustomError("No pending OTP found for Player.");
  
      let isValid = verifyTotp(otpSecret.reverse()[0].secret, req.body.otp);
      if (isValid) {
        await PlayerModel.findOneAndUpdate(
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

//Update Player API
  export const updatePlayerHandler = async (req, res) => {
    try {
      await updatePlayerValidation.validateAsync(req.body);
      const playerId = req.params.id;
      const player = await PlayerModel.findOne({
        _id: playerId,
        isDeleted: false,
      });
  
      if (!player)
        throw new CustomError(
          `The Player you are trying to update is deleted or does not exist.`
        );

      let keys = [];
      for (let key in req.body) {
        keys.push(key);
      }
  
      for (let i = 0; i < keys.length; ++i) {
        player[keys[i]] = req.body[keys[i]];
      }
  
      await player.save();
      return res
        .status(StatusCodes.OK)
        .send(
          responseGenerators({ ...player.toJSON() }, StatusCodes.OK, "SUCCESS", 0)
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

// Block-Unblock Player API
  export const toggleBlockUnblockHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!id) throw new CustomError("Please provide a valid ID");
  
      if (status == undefined) throw new CustomError("Invalid status provided");
  
      const customer = await PlayerModel.findById(id);
      if (!customer) {
        throw new CustomError("Player not found");
      }
  
      const newStatus = status ? true : false;
  
      // Toggle isBlocked field based on new status
      const updatedPlayer = await PlayerModel.findByIdAndUpdate(
        id,
        { isBlocked: newStatus },
        { new: true }
      );
  
      res.status(StatusCodes.OK).json({
        message: `Customer ${
          updatedPlayer.isBlocked ? "blocked" : "unblocked"
        } successfully`,
        customer: updatedPlayer,
      });
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
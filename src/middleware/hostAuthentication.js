import { StatusCodes } from "http-status-codes";
import { ERROR } from "../commons/global-constants";
import { verifyJwt } from "../helpers/Jwt.helper";
import { responseGenerators } from "../lib/utils";
import { TokenExpiredError } from "jsonwebtoken";
import { decryptData } from "../commons/common-functions";
import HostModel from "../models/host";

export const authenticateHost = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators(
            {},
            StatusCodes.UNAUTHORIZED,
            ERROR.PROVIDE_TOKEN_ERROR,
            1
          )
        );
    }
    // decryptData authorization
    let jwtToken = decryptData(authorization);
    if (!jwtToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators({}, StatusCodes.UNAUTHORIZED, `Access denied`, 1)
        );
    }
    // Verify JWT token
    let tokenData = await verifyJwt(jwtToken);

    let host = await HostModel.findOne({
      _id: tokenData.id,
      isVerified: true,
    })
      .lean()
      .exec();

    if (!host) {
      // User does not exist, return unauthorized response
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators(
            {},
            StatusCodes.UNAUTHORIZED,
            ERROR.TOKEN_EXPIRED,
            1
          )
        );
    }
    // User token and user are valid, continue to the next middleware
    req.session = host;
    next();
  } catch (error) {
    // JWT verification failed, return unauthorized response
    if (error instanceof TokenExpiredError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators(
            {},
            StatusCodes.UNAUTHORIZED,
            `Token is expired`,
            1
          )
        );
    }
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send(
        responseGenerators(
          {},
          StatusCodes.UNAUTHORIZED,
          ERROR.PROVIDE_TOKEN_ERROR,
          1
        )
      );
  }
};

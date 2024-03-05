import { StatusCodes } from "http-status-codes";
import { ValidationError } from "joi";
import {
  comparePassword,
  encryptData,
  hashPassword,
} from "../../commons/common-functions";
import { getJwt } from "../../helpers/Jwt.helper";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import AdminModel from "../../models/admin";

// Create Admin
export const createAdminHandler = async (req, res) => {
  try {
    const { fname, lname, email, phone, password } = req.body;

    const isAvailable = await AdminModel.findOne({
      isDeleted: false,
      email: email.toLowerCase(),
    });
    if (isAvailable)
      throw new CustomError(`Admin with given email already exists`);

    const hashedPassword = await hashPassword(password);

    const adminData = await AdminModel.create({
      fname,
      lname,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { ...adminData.toJSON() },
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

// updated Admin
export const updateAdminHandler = async (req, res) => {
  try {
    const { fname, lname, email, phone } = req.body;
    const adminId = req.params.id;

    let isAvailable = await AdminModel.findOne({
      _id: { $ne: adminId },
      isDeleted: false,
      email: email.toLowerCase(),
    });
    if (isAvailable)
      throw new CustomError(
        `Admin already exists with the provided email address`
      );

    isAvailable = await AdminModel.findOne({
      _id: { $ne: adminId },
      isDeleted: false,
      phone,
    });
    if (isAvailable)
      throw new CustomError(`Admin already exists with the provided phone`);

    const updatedData = await AdminModel.findOneAndUpdate(
      { _id: adminId },
      { fname, lname, email: email.toLowerCase(), phone },
      { new: true }
    );

    if (!updatedData) throw new CustomError(`Admin does not exist`);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { ...updatedData.toJSON() },
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

// delete AdminModel
export const deleteAdminHandler = async (req, res) => {
  try {
    const adminId = req.params.id;
    if (!adminId) throw new CustomError(`Please provide valid id`);

    const isAvailable = await AdminModel.findOne({
      isDeleted: false,
      _id: adminId,
    });

    if (!isAvailable) throw new CustomError(`Admin doesn't exist`);

    isAvailable.isDeleted = true;
    await isAvailable.save();

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators({}, StatusCodes.OK, "SUCCESS", 0));
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

// login AdminModel
export const loginAdminHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginData = await AdminModel.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });

    if (!loginData) throw new CustomError(`Invalid email or password.`);

    const isPasswordMatched = await comparePassword(
      password,
      loginData.password
    );
    if (!isPasswordMatched) throw new CustomError(`Invalid email or password.`);

    loginData.lastLogin = new Date();
    await loginData.save();

    const token = await getJwt({ id: loginData._id, superAdmin: true });

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          token: encryptData(token),
          userData: loginData,
          loginCompleted: true,
        },
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

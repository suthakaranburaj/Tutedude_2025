import sendResponse from "../utils/apiResonse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModal.js";
import { statusType } from "../utils/statusType.js"; // Make sure this is correctly imported

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return sendResponse(
      res,
      false,
      null,
      "Unauthorized request: Token missing",
      statusType.UNAUTHORIZED
    );
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return sendResponse(
        res,
        false,
        null,
        "Unauthorized request: Invalid access token",
        statusType.UNAUTHORIZED
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(
      res,
      false,
      null,
      error?.message || "Unauthorized request: Token verification failed",
      statusType.UNAUTHORIZED
    );
  }
});

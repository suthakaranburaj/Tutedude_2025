//auth.middleware.js

import { sendResponse } from "../utils/apiResonse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { statusType } from "../utils/statusType.js"; // Make sure this is correctly imported
import User from "../models/user.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
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

    // const user = await User.findById(decodedToken?._id).select(
    //   "-password -refreshToken"
    // );
    const user = await User.findById(decodedToken?.user_id).select(
      "-pin"
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

const supplierCheck = (req, res, next) => {
    if (req.user.role !== "supplier") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Supplier role required"
        });
    }
    next();
};


const agentCheck = (req, res, next) => {
    if (req.user.role !== "agent") {
        return res.status(403).json({
            success: false,
            message: "Access denied. agent role required"
        });
    }
    next();
};
export { verifyJWT, supplierCheck,agentCheck };
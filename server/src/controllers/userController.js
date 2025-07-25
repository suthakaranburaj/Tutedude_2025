import User from "../models/user.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import bcrypt from "bcrypt"
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";
import { validatePhone } from "../helper/common.js";
import { createToken } from "../helper/common.js";

const registerUser = asyncHandler(async (req, res) => {
    const { name, phone, pin, role } = req.body;

    if (!name || !phone || !pin || !role) {
        return sendResponse(
            res,
            false,
            null,
            "Fields cannot be empty",
            statusType.BAD_REQUEST
        );
    }

    // Check if user already exists
    let user = await User.findOne({ phone });

    if (user) {
        return sendResponse(
            res,
            false,
            null,
            "User Already Exists, Please Login",
            statusType.BAD_REQUEST
        );
    }

    // Validate phone format
    if (!validatePhone(phone)) {
        return sendResponse(
            res,
            false,
            null,
            "Phone number must be a valid phone number",
            statusType.BAD_REQUEST
        );
    }

    // Create new user
    user = new User({ name, phone, pin, role });

    // Hash PIN
    const salt = await bcrypt.genSalt(10);
    user.pin = await bcrypt.hash(pin, salt);

    // Save to DB
    await user.save();

    // Generate token
    const token = createToken(user._id);

    // Prepare response data (exclude PIN)
    const userData = user.toObject();
    delete userData.pin;

    return sendResponse(
        res,
        true,
        { ...userData, token },
        "User Created Successfully",
        statusType.CREATED
    );
});


const loginUser = asyncHandler(async (req, res) => {
  const { phone, pin } = req.body;

  // Check for empty input
  if (!phone || !pin) {
    return sendResponse(res, false, null, "Phone and PIN are required", statusType.BAD_REQUEST);
  }

  // Validate phone number format
  if (!validatePhone(phone)) {
    return sendResponse(res, false, null, "Please enter a valid phone number", statusType.BAD_REQUEST);
  }

  // Find user by phone
  const user = await User.findOne({ phone });

  if (!user) {
    return sendResponse(res, false, null, "User doesn't exist, please create your account", statusType.BAD_REQUEST);
  }

  // Compare PIN
  const isValid = await bcrypt.compare(pin, user.pin);
  if (!isValid) {
    return sendResponse(res, false, null, "Phone or PIN is incorrect", statusType.BAD_REQUEST);
  }

  // Create token
  const token = createToken(user._id);

  // Exclude hashed pin
  const userData = user.toObject();
  delete userData.pin;

  // Send response
  return sendResponse(res, true, { ...userData, token }, "Login Successful", statusType.SUCCESS);
});


export { registerUser, loginUser };
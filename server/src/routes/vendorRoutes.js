import express from "express";
import { updateVendorProfile } from "../controllers/vendorController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.put("/profile", verifyJWT, updateVendorProfile);

export default router;
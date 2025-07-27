// routes/userRoutes.js
import express from "express";
import {
    getAllVendors,
    addFeedback,
    rateVendor,
    getUserProfile,
    updateUserProfile
} from "../controllers/normalUserController.js";
import { normalUserCheck } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(normalUserCheck);

router.get("/vendors", getAllVendors);
router.post("/feedback", addFeedback);
router.post("/rate", rateVendor);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

export default router;

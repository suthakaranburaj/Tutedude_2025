// routes/userRoutes.js
import express from "express";
import {
    getAllVendors,
    addFeedback,
    checkUserFeedback,
    rateVendor,
    getUserProfile,
    updateUserProfile,
    getVendorFeedback,
    getUserFeedbackHistory,
    getVendorById
} from "../controllers/normalUserController.js";
import { normalUserCheck } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.use(normalUserCheck);

router.get("/vendors", getAllVendors);
router.post("/feedback", upload.array("images", 5), addFeedback);
router.get("/feedback/history", getUserFeedbackHistory);
router.get("/feedback/:vendorId", checkUserFeedback);
router.post("/rate", rateVendor);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
// routes/userRoutes.js
router.get("/vendors/:vendorId/feedback", getVendorFeedback);
router.get("/vendors/:vendorId", getVendorById);
export default router;

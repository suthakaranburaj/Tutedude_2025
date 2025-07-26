import express from "express";
import { updateVendorProfile } from "../controllers/vendorController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllSupplier } from "../controllers/supplierController.js";

const router = express.Router();


router.put("/profile", updateVendorProfile);
router.get("/allSupplier",getAllSupplier);

export default router;
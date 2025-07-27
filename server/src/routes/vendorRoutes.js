//vendorRoutes.js

import express from "express";
import {getAllSupplier} from "../controllers/supplierController.js"
import { updateVendorProfile,getVendorProfile,getVendorDashboard } from "../controllers/vendorController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.put("/profile", verifyJWT, updateVendorProfile);
router.get("/profile", verifyJWT, getVendorProfile);
router.get("/allSupplier", getAllSupplier);
router.get("/getdashboard", verifyJWT, getVendorDashboard);
export default router;
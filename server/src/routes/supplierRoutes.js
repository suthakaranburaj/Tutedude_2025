// routes/supplierRoutes.js
import express from "express";
import {
    createOrUpdateSupplierProfile,
    addInventoryItem,
    updateInventoryItem,
    getSupplierDashboard,
    getInventory,
    updateDeliveryRadius,
    getOrderHistory,
    getSupplierProfile
} from "../controllers/supplierController.js";
import { supplierCheck } from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.use(protect);
router.use(supplierCheck);

router.post("/profile", createOrUpdateSupplierProfile);
router.post("/inventory", addInventoryItem);
router.put("/inventory", updateInventoryItem);
router.get("/dashboard", getSupplierDashboard);
router.get("/inventory", getInventory);
router.put("/delivery-radius", updateDeliveryRadius);
router.get("/orders", getOrderHistory);
router.get("/profile", getSupplierProfile);

export default router;

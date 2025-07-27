import express from "express";
import {
    createOrder,
    updateOrderStatus,
    getOrderDetails,
    getVendorOrders,
    getSupplierOrders,
    cancelOrder
} from "../controllers/orderController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Vendor routes
router.route("/").post(createOrder);

router.route("/vendor").get(getVendorOrders);

router.route("/:orderId/cancel").put(cancelOrder);

// Supplier routes
router.route("/supplier").get(getSupplierOrders);

// Shared routes
router
    .route("/:orderId")
    .get(getOrderDetails)
    .put(updateOrderStatus);

export default router;

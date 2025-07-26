import Order from "../models/order.js";
import Vendor from "../models/vendor.js";
import Supplier from "../models/supplier.js";
import InventoryItem from "../models/inventoryItem.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
    const vendorId = req.user._id;
    const {
        supplierId,
        items,
        deliveryLocation,
        preferredDeliveryTime,
        paymentMethod,
        specialInstructions
    } = req.body;

    // Validate input
    if (!supplierId || !items || items.length === 0 || !deliveryLocation || !paymentMethod) {
        return sendResponse(
            res,
            false,
            null,
            "Supplier ID, items, delivery location, and payment method are required",
            statusType.BAD_REQUEST
        );
    }

    // Check vendor status
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || !vendor.canOrderSupply) {
        return sendResponse(
            res,
            false,
            null,
            "Vendor is not authorized to place orders",
            statusType.FORBIDDEN
        );
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
        const inventoryItem = await InventoryItem.findById(item.itemId);
        if (!inventoryItem) {
            return sendResponse(
                res,
                false,
                null,
                `Inventory item not found: ${item.itemId}`,
                statusType.NOT_FOUND
            );
        }

        if (inventoryItem.quantity < item.quantity) {
            return sendResponse(
                res,
                false,
                null,
                `Insufficient stock for item: ${inventoryItem.itemName}`,
                statusType.BAD_REQUEST
            );
        }

        const itemTotal = inventoryItem.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
            itemId: item.itemId,
            quantity: item.quantity,
            priceAtOrder: inventoryItem.price,
            itemName: inventoryItem.itemName,
            unit: inventoryItem.unit
        });
    }

    // Create order
    const newOrder = new Order({
        vendor: vendorId,
        supplier: supplierId,
        items: orderItems,
        totalAmount,
        deliveryLocation: {
            type: "Point",
            coordinates: [deliveryLocation.lng, deliveryLocation.lat],
            address: deliveryLocation.address
        },
        preferredDeliveryTime,
        paymentMethod,
        specialInstructions
    });

    const savedOrder = await newOrder.save();

    // Update vendor and supplier
    await Vendor.findByIdAndUpdate(vendorId, {
        $push: {
            orderHistory: savedOrder._id,
            orderTracking: {
                orderId: savedOrder._id,
                status: "pending",
                estimatedDelivery: preferredDeliveryTime
            }
        }
    });

    await Supplier.findByIdAndUpdate(supplierId, {
        $push: { orderHistory: savedOrder._id }
    });

    // Update inventory quantities
    for (const item of items) {
        await InventoryItem.findByIdAndUpdate(item.itemId, {
            $inc: { quantity: -item.quantity }
        });
    }

    return sendResponse(res, true, savedOrder, "Order created successfully", statusType.CREATED);
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, estimatedDelivery } = req.body;
    const userId = req.user._id; // Could be supplier or vendor

    if (!status) {
        return sendResponse(res, false, null, "Status is required", statusType.BAD_REQUEST);
    }

    const validStatuses = [
        "pending",
        "accepted",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "rejected"
    ];
    if (!validStatuses.includes(status)) {
        return sendResponse(res, false, null, "Invalid status value", statusType.BAD_REQUEST);
    }

    const updateData = { status };
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;

    // Set actual delivery time if status is delivered
    if (status === "delivered") {
        updateData.actualDelivery = Date.now();
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true }).populate(
        "vendor supplier",
        "businessName userId"
    );

    if (!updatedOrder) {
        return sendResponse(res, false, null, "Order not found", statusType.NOT_FOUND);
    }

    // Update vendor's order tracking
    await Vendor.findOneAndUpdate(
        { _id: updatedOrder.vendor, "orderTracking.orderId": orderId },
        {
            $set: {
                "orderTracking.$.status": status,
                "orderTracking.$.estimatedDelivery":
                    estimatedDelivery || updatedOrder.orderTracking?.estimatedDelivery
            }
        }
    );

    return sendResponse(res, true, updatedOrder, "Order status updated", statusType.SUCCESS);
});

// Get order details
export const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
        .populate("vendor", "businessName operatingLocations")
        .populate("supplier", "deliveryRadius userId")
        .populate("items.itemId", "itemName unit");

    if (!order) {
        return sendResponse(res, false, null, "Order not found", statusType.NOT_FOUND);
    }

    return sendResponse(res, true, order, "Order details retrieved", statusType.SUCCESS);
});

// Get orders for vendor
export const getVendorOrders = asyncHandler(async (req, res) => {
    const vendorId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const filter = { vendor: vendorId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate("supplier", "userId");

    const totalOrders = await Order.countDocuments(filter);

    return sendResponse(
        res,
        true,
        {
            orders,
            total: totalOrders,
            page: parseInt(page),
            pages: Math.ceil(totalOrders / parseInt(limit))
        },
        "Vendor orders retrieved",
        statusType.SUCCESS
    );
});

// Get orders for supplier
export const getSupplierOrders = asyncHandler(async (req, res) => {
    const supplierId = req.user._id; // Assuming supplier is authenticated
    const { status, limit = 10, page = 1 } = req.query;

    const filter = { supplier: supplierId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate("vendor", "businessName");

    const totalOrders = await Order.countDocuments(filter);

    return sendResponse(
        res,
        true,
        {
            orders,
            total: totalOrders,
            page: parseInt(page),
            pages: Math.ceil(totalOrders / parseInt(limit))
        },
        "Supplier orders retrieved",
        statusType.SUCCESS
    );
});

// Cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const vendorId = req.user._id;

    const order = await Order.findOne({
        _id: orderId,
        vendor: vendorId,
        status: { $in: ["pending", "accepted"] }
    });

    if (!order) {
        return sendResponse(
            res,
            false,
            null,
            "Order cannot be cancelled at this stage",
            statusType.BAD_REQUEST
        );
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: "cancelled" },
        { new: true }
    );

    // Update vendor tracking
    await Vendor.findOneAndUpdate(
        { _id: vendorId, "orderTracking.orderId": orderId },
        { $set: { "orderTracking.$.status": "cancelled" } }
    );

    // Restore inventory quantities
    for (const item of order.items) {
        await InventoryItem.findByIdAndUpdate(item.itemId, {
            $inc: { quantity: item.quantity }
        });
    }

    return sendResponse(
        res,
        true,
        updatedOrder,
        "Order cancelled successfully",
        statusType.SUCCESS
    );
});

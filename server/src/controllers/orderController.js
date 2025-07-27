import Order from "../models/Order.js";
import Vendor from "../models/vendor.js";
import Supplier from "../models/supplier.js";
import InventoryItem from "../models/inventoryItem.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";
import mongoose from "mongoose";


// Create a new order
export const createOrder = asyncHandler(async (req, res) => {

    // console.log(req.body);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { supplierId, items, deliveryLocation, preferredDeliveryTime } = req.body;
        const paymentMethod = req.body.paymentMethod || "upi";
        const specialInstructions = req.body.specialInstructions || "";

        // Validate input
        if (!supplierId || !items?.length || !deliveryLocation) {
            await session.abortTransaction();
            return sendResponse(res, false, null, "Missing required fields", statusType.BAD_REQUEST);
        }
        console.log(1);

        // Verify vendor
        const vendor = await Vendor.findOne({ userId }).session(session);
        if (!vendor?.canOrderSupply) {
            await session.abortTransaction();
            return sendResponse(res, false, null, "Vendor not authorized", statusType.FORBIDDEN);
        }

        console.log(2);

        // Find supplier
        const supplier = await Supplier.findOne({ userId: supplierId }).session(session);
        if (!supplier) {
            console.log(12)
            await session.abortTransaction();
            return sendResponse(res, false, null, "Supplier not found", statusType.NOT_FOUND);
        }


        console.log(3);

        // Process items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            // Find the inventory item
            console.log(item.itemId);
            const inventoryItem = await InventoryItem.findOne({ _id: item.itemId }).session(session);
            console.log("Inv Item", inventoryItem);

            if (!inventoryItem) {
                console.log(9)
                await session.abortTransaction();
                return sendResponse(res, false, null, `Item ${item.itemId} not found`, statusType.NOT_FOUND);
            }

            // Verify the item belongs to this supplier
            if (!supplier.inventory.includes(item.itemId)) {
                console.log(10)
                await session.abortTransaction();
                return sendResponse(res, false, null, `Item ${item.itemId} not in supplier inventory`, statusType.BAD_REQUEST);
            }

            console.log("lol")
            console.log(inventoryItem.quantity)
            console.log(item.quantity);

            if (inventoryItem.quantity < item.quantity) {
                console.log(11)
                await session.abortTransaction();
                return sendResponse(res, false, null, `Insufficient stock for ${inventoryItem.itemName}`, statusType.BAD_REQUEST);
            }

            totalAmount += inventoryItem.price * item.quantity;
            orderItems.push({
                itemId: item.itemId,
                quantity: item.quantity,
                priceAtOrder: inventoryItem.price,
                itemName: inventoryItem.itemName,
                unit: inventoryItem.unit
            });
        }


        console.log(4);

        // Create order
        const newOrder = new Order({
            vendor: userId,
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
            specialInstructions,
            status: "pending",
            paymentStatus: "pending"
        });


        console.log(5);

        const savedOrder = await newOrder.save({ session });

        // Update vendor
        await Vendor.findOneAndUpdate(
            { userId },
            {
                $push: {
                    orderHistory: savedOrder._id,
                    orderTracking: {
                        orderId: savedOrder._id,
                        status: "pending",
                        estimatedDelivery: preferredDeliveryTime,
                        createdAt: new Date()
                    }
                }
            },
            { session }
        );


        console.log(6);

        // Update supplier order history
        await Supplier.findByIdAndUpdate(
            supplierId,
            {
                $push: {
                    orderHistory: savedOrder._id,
                    orderTracking: {
                        orderId: savedOrder._id,
                        status: "pending",
                        vendorId: userId,
                        estimatedDelivery: preferredDeliveryTime
                    }
                }
            },
            { session }
        );


        console.log(7);

        // Update inventory items
        for (const item of items) {
            await InventoryItem.findByIdAndUpdate(
                item.itemId,
                {
                    $inc: { quantity: -item.quantity },
                    $set: { lastUpdated: new Date() }
                },
                { session }
            );
        }

        await session.commitTransaction();

        console.log(8);

        return sendResponse(res, true, savedOrder, "Order created successfully", statusType.CREATED);

    } catch (error) {
        await session.abortTransaction();
        console.error("Order creation error:", error);

        if (error instanceof mongoose.Error.CastError) {
            return sendResponse(res, false, null, "Invalid data format", statusType.BAD_REQUEST);
        }

        return sendResponse(res, false, null, "Internal server error", statusType.INTERNAL_SERVER_ERROR);
    } finally {
        session.endSession();
    }
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, estimatedDelivery } = req.body;
    const userId = req.user._id;

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
    if (status === "delivered") updateData.actualDelivery = Date.now();

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    if (!updatedOrder) {
        return sendResponse(res, false, null, "Order not found", statusType.NOT_FOUND);
    }

    // Update vendor's order tracking
    await Vendor.findOneAndUpdate(
        { userId: updatedOrder.vendor, "orderTracking.orderId": orderId },
        {
            $set: {
                "orderTracking.$.status": status,
                ...(estimatedDelivery && {
                    "orderTracking.$.estimatedDelivery": estimatedDelivery
                })
            }
        }
    );

    return sendResponse(res, true, updatedOrder, "Order status updated", statusType.SUCCESS);
});

// Get order details
export const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
        .populate("vendor", "businessName")
        .populate("supplier", "businessName");

    if (!order) {
        return sendResponse(res, false, null, "Order not found", statusType.NOT_FOUND);
    }

    return sendResponse(res, true, order, "Order details retrieved", statusType.SUCCESS);
});

// Get orders for vendor
export const getVendorOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
        return sendResponse(res, false, null, "Vendor not found", statusType.NOT_FOUND);
    }

    const filter = { vendor: vendor.userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate("supplier", "businessName");

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
    const userId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const supplier = await Supplier.findOne({ userId });
    if (!supplier) {
        return sendResponse(res, false, null, "Supplier not found", statusType.NOT_FOUND);
    }

    const filter = { supplier: supplier.userId };
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
    const userId = req.user._id;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
        return sendResponse(res, false, null, "Vendor not found", statusType.NOT_FOUND);
    }

    const order = await Order.findOne({
        _id: orderId,
        vendor: vendor.userId,
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

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: "cancelled" },
        { new: true }
    );

    // Update vendor tracking
    await Vendor.updateOne(
        { _id: vendor._id, "orderTracking.orderId": orderId },
        { $set: { "orderTracking.$.status": "cancelled" } }
    );

    // Restore inventory quantities in Supplier's inventory
    for (const item of order.items) {
        await Supplier.updateOne(
            { _id: order.supplier, "inventory._id": item.itemId },
            { $inc: { "inventory.$.quantity": item.quantity } }
        );
    }

    return sendResponse(
        res,
        true,
        updatedOrder,
        "Order cancelled successfully",
        statusType.SUCCESS
    );
});

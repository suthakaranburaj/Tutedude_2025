// models/order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtOrder: {
        type: Number,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "packed",
                "shipped",
                "delivered",
                "cancelled",
                "rejected"
            ],
            default: "pending"
        },
        deliveryLocation: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            },
            address: String
        },
        preferredDeliveryTime: Date,
        estimatedDelivery: Date,
        actualDelivery: Date,
        paymentMethod: String,
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending"
        },
        specialInstructions: String
    },
    {
        timestamps: true
    }
);

// Geospatial index for delivery locations
orderSchema.index({ deliveryLocation: "2dsphere" });

const Order = mongoose.model("Order", orderSchema);
export default Order;

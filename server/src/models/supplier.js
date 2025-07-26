// models/supplier.js
import mongoose from "mongoose";
import {inventoryItemSchema} from "./inventoryItem.js"; 


const supplierSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        inventory: [inventoryItemSchema],
        pricePredictionModel: String,
        dashboardStats: {
            totalItems: { type: Number, default: 0 },
            lastRestocked: Date
        },
        deliveryRadius: {
            radiusInKm: { type: Number, required: true, min: 1 },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true }
            }
        },
        orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
    },
    { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);

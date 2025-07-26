// models/supplier.js
import mongoose from "mongoose";
import { inventoryItemSchema } from "./inventoryItem.js";


const supplierSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        // New fields to match frontend
        companyName: {
            type: String,
            required: true,
            trim: true
        },
        businessAddress: {
            type: String,
            required: true
        },
        gstNumber: {
            type: String,
            required: true,
            unique: true
        },
        panNumber: {
            type: String,
            required: true,
            unique: true
        },
        businessType: {
            type: String,
            enum: ["Proprietorship", "Partnership", "Private Limited", "LLP", "Other"],
            default: "Proprietorship"
        },
        registrationDate: {
            type: Date,
            required: true
        },
        documents: [
            {
                name: String,
                status: {
                    type: String,
                    enum: ["pending", "verified", "rejected"],
                    default: "pending"
                },
                uploaded: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        // Existing fields
        inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" }],
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

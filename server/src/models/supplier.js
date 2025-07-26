// models/supplier.js
import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ["kg", "g", "lb", "pieces", "liters"] },
    price: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

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

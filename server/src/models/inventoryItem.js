import mongoose from "mongoose";

export const inventoryItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ["kg", "g", "lb", "pieces", "liters"] },
    price: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("InventoryItem", inventoryItemSchema);

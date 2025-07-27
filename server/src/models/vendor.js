import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        canOrderSupply: { type: Boolean, default: true },
        paymentMethods: [String],
        dashboard: {
            totalOrders: Number,
            pendingOrders: Number,
        },
        orderTracking: [
            {
                orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
                status: String,
                estimatedDelivery: Date,
            },
        ],
        orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
        groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
        feedbackQRCode: String,

        businessName: {
            type: String,
            trim: true
        },
        businessType: {
            type: String,
            enum: ["cart", "stall", "food_truck", "small_shop"],
            default: "cart"
        },
        operatingLocations: [{
            name: String,
            address: String,
            primary: Boolean
        }],
        operatingHours: {
            start: { type: String, match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ }, // HH:MM format
            end: { type: String, match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ }
        },
        daysOfOperation: {
            type: [{
                type: String,
                enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
            }],
            default: ["mon", "tue", "wed", "thu", "fri", "sat"]
        },

        // Specializations
        cuisineTypes: [{
            type: String,
            enum: ["north_indian", "south_indian", "chinese", "street_food", "sweets", "beverages"]
        }],
        averageDailyCustomers: Number,
        monthlyRevenue: Number,

        // Vendor Preferences
        preferredDeliveryTime: { // Preferred time for raw material delivery
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
        },
        // Verification Status
        verified: {
            type: Boolean,
            default: false
        },
        verificationDocuments: [String] // URLs to documents
    },
    { timestamps: true }
);
vendorSchema.index({ "operatingLocations.coordinates": "2dsphere" });
vendorSchema.index({
    businessName: "text",
    cuisineTypes: "text"
});


const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;

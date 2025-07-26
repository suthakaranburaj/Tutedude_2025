import mongoose from "mongoose";

const inventoryDetailsSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "InventoryItem",
          required: true
    },
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
        required: true
    },
    qualityRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    productReview:{
        type: String
    },
    imageUrl:{
        type: Array,
       required: true
    }
});

export default mongoose.model("InventoryDetail", inventoryDetailsSchema);

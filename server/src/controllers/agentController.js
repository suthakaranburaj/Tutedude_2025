import InventoryDetail from "../models/inventorydetails.js";
import Supplier from "../models/supplier.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


export const verifyInventoryItem = asyncHandler(async (req, res) => {
    const { productId, verificationStatus, qualityRating, productReview } = req.body;

    if (!verificationStatus || !qualityRating || !productId) {
        return sendResponse(
            res,
            false,
            null,
            "All parameters of product feedback are required",
            statusType.BAD_REQUEST
        );
    }
    if(req.files.images.length === 0){
        return sendResponse(
            res,
            false,
            null,
            "All parameters of product feedback are required",
            statusType.BAD_REQUEST
        );
    }

    let imageUrlArray = [];

    if (req.files && req.files.images && Array.isArray(req.files.images)) {
        for (const file of req.files.images) {
            const uploadResult = await uploadOnCloudinary(file.path);
            if (uploadResult?.secure_url) {
                imageUrlArray.push(uploadResult.secure_url);
            }
        }
    }


    const newItem = {
        verificationStatus,
        qualityRating,
        imageUrl:imageUrlArray,
        productReview
    };

    const product = await InventoryDetail.create({
        productId: productId,
        ...newItem
    });


    return sendResponse(
        res,
        true,
        product,
        "Product feedback added successfully",
        statusType.CREATED
    );
});

// Get all inventory items from all suppliers
export const getAllInventoryItems = asyncHandler(async (req, res) => {
    try {
        // Aggregate all inventory items with supplier information and approval status
        const result = await Supplier.aggregate([
            // Unwind the inventory array to treat each item as a separate document
            { $unwind: "$inventory" },
            
            // Lookup supplier details
            {
                $lookup: {
                    from: "users", // Collection name for users
                    localField: "userId",
                    foreignField: "_id",
                    as: "supplierInfo"
                }
            },
            
            // Unwind the supplierInfo array
            { $unwind: "$supplierInfo" },
            
            // Lookup approval status from InventoryDetail collection
            {
                $lookup: {
                    from: "inventorydetails", // Collection name for InventoryDetail
                    let: { inventoryItemId: "$inventory._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$productId", "$$inventoryItemId"]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                verificationStatus: 1
                            }
                        }
                    ],
                    as: "verification"
                }
            },
            
            // Add field to check verification status
            {
                $addFields: {
                    verificationStatus: {
                        $arrayElemAt: ["$verification.verificationStatus", 0]
                    }
                }
            },
            
            // Filter out verified and rejected items
            {
                $match: {
                    $or: [
                        { verificationStatus: { $exists: false } }, // No verification record
                        { verificationStatus: "pending" }, // Only pending status
                        { verificationStatus: { $nin: ["verified", "rejected"] } } // Other statuses
                    ]
                }
            },
            
            // Project the desired fields
            {
                $project: {
                    _id: "$inventory._id",
                    itemName: "$inventory.itemName",
                    quantity: "$inventory.quantity",
                    unit: "$inventory.unit",
                    price: "$inventory.price",
                    lastUpdated: "$inventory.lastUpdated",
                    supplier: {
                        supplierId: "$_id",
                        userId: "$userId",
                        name: "$supplierInfo.name",
                        phone: "$supplierInfo.phone",
                        deliveryRadius: "$deliveryRadius",
                        coordinates: "$deliveryRadius.coordinates"
                    },
                    verificationStatus: 1
                }
            },
            
            // Sort by last updated (newest first)
            { $sort: { "lastUpdated": -1 } }
        ]);

        return sendResponse(
            res,
            true,
            result,
            "All inventory items retrieved",
            statusType.SUCCESS
        );
    } catch (error) {
        return sendResponse(
            res,
            false,
            null,
            "Error retrieving inventory: " + error.message,
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});
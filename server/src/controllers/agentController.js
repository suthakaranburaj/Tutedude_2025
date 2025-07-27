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
            "Verification status, quality rating, and product ID are required",
            statusType.BAD_REQUEST
        );
    }

    // Check if files exist
    if (!req.files || !req.files.images || req.files.images.length === 0) {
        return sendResponse(
            res,
            false,
            null,
            "At least one image is required",
            statusType.BAD_REQUEST
        );
    }

    let imageUrlArray = [];

    // Process each image file
    for (const file of req.files.images) {
        const uploadResult = await uploadOnCloudinary(file.path);
        if (uploadResult?.secure_url) {
            imageUrlArray.push(uploadResult.secure_url);
        }
    }

    // Create inventory detail document
    const product = await InventoryDetail.create({
        productId,
        verificationStatus,
        qualityRating,
        imageUrl: imageUrlArray,
        productReview: productReview || ""
    });

    return sendResponse(
        res,
        true,
        product,
        "Product verification submitted successfully",
        statusType.CREATED
    );
});

export const getAllInventoryItems = asyncHandler(async (req, res) => {
    try {
        const result = await Supplier.aggregate([
            // Lookup inventory items
            {
                $lookup: {
                    from: "inventoryitems",
                    localField: "inventory",
                    foreignField: "_id",
                    as: "inventoryItems"
                }
            },
            { $unwind: "$inventoryItems" },

            // Lookup user info
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "supplierInfo"
                }
            },
            { $unwind: "$supplierInfo" },

            // Lookup verification status
            {
                $lookup: {
                    from: "inventorydetails",
                    let: { itemId: "$inventoryItems._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$productId", "$$itemId"] }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 1 },
                        { $project: { verificationStatus: 1 } }
                    ],
                    as: "verification"
                }
            },
            {
                $addFields: {
                    verificationStatus: {
                        $ifNull: [{ $arrayElemAt: ["$verification.verificationStatus", 0] }, null]
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { verificationStatus: null },
                        { verificationStatus: "pending" },
                        { verificationStatus: { $nin: ["verified", "rejected"] } }
                    ]
                }
            },
            {
                $project: {
                    _id: "$inventoryItems._id",
                    itemName: "$inventoryItems.itemName",
                    quantity: "$inventoryItems.quantity",
                    unit: "$inventoryItems.unit",
                    price: "$inventoryItems.price",
                    lastUpdated: "$inventoryItems.lastUpdated",
                    supplier: {
                        supplierId: "$_id",
                        userId: "$userId",
                        name: "$supplierInfo.name",
                        phone: "$supplierInfo.phone",
                        deliveryRadius: "$deliveryRadius"
                    },
                    verificationStatus: 1
                }
            },
            { $sort: { lastUpdated: -1 } }
        ]);

        return sendResponse(
            res,
            true,
            result,
            "Inventory items retrieved successfully",
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

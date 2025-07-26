import InventoryDetail from "../models/inventorydetails.js";
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
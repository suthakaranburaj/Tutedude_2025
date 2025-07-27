// controllers/userController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import {sendResponse} from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";
import User from "../models/user.js";
import Vendor from "../models/vendor.js";
import Feedback from "../models/feedback.js";
import Rating from "../models/rating.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all vendors
export const getAllVendors = asyncHandler(async (req, res) => {
    const { cuisine, minRating, location, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Apply filters
    if (cuisine) query.cuisineTypes = cuisine;
    if (minRating) query.averageRating = { $gte: Number(minRating) };
    if (location) {
        query.$or = [
            { "operatingLocations.name": { $regex: location, $options: "i" } },
            { "operatingLocations.address": { $regex: location, $options: "i" } }
        ];
    }

    const vendors = await Vendor.find(query)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name phone image")
        .lean();

    // Calculate average ratings
    for (const vendor of vendors) {
        const ratings = await Rating.find({ vendorId: vendor._id });
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length || 0;
        vendor.averageRating = avgRating.toFixed(1);
    }

    const total = await Vendor.countDocuments(query);

    return sendResponse(
        res,
        true,
        { vendors, page, pages: Math.ceil(total / limit), total },
        "Vendors retrieved successfully",
        statusType.SUCCESS
    );
});

// Add feedback for a vendor
export const addFeedback = asyncHandler(async (req, res) => {
    const { vendorId, comment, rating } = req.body;
    const userId = req.user._id;

    if (!vendorId || !comment || !rating) {
        return sendResponse(
            res,
            false,
            null,
            "Vendor ID, comment, and rating are required",
            statusType.BAD_REQUEST
        );
    }

    if (rating < 1 || rating > 5) {
        return sendResponse(
            res,
            false,
            null,
            "Rating must be between 1 and 5",
            statusType.BAD_REQUEST
        );
    }

    // Check if user has already submitted feedback for this vendor
    const existingFeedback = await Feedback.findOne({ userId, vendorId });
    if (existingFeedback) {
        return sendResponse(
            res,
            false,
            null,
            "You have already submitted feedback for this vendor",
            statusType.BAD_REQUEST
        );
    }

    let imageUrls = [];

    // Handle image uploads if present
    if (req.files && req.files.images && Array.isArray(req.files.images)) {
        for (const file of req.files.images) {
            const uploadResult = await uploadOnCloudinary(file.path);
            if (uploadResult?.secure_url) {
                imageUrls.push(uploadResult.secure_url);
            }
        }
    }

    const feedback = new Feedback({
        userId,
        vendorId,
        comment,
        rating,
        images: imageUrls
    });

    await feedback.save();

    // Also update the rating in the Rating collection
    let existingRating = await Rating.findOne({ userId, vendorId });
    if (existingRating) {
        existingRating.rating = rating;
        await existingRating.save();
    } else {
        existingRating = new Rating({
            userId,
            vendorId,
            rating
        });
        await existingRating.save();
    }

    // Update vendor's average rating
    const ratings = await Rating.find({ vendorId });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Vendor.findByIdAndUpdate(vendorId, {
        averageRating: avgRating.toFixed(1)
    });

    return sendResponse(res, true, feedback, "Feedback added successfully", statusType.CREATED);
});

// Check if user has already submitted feedback for a vendor
export const checkUserFeedback = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const userId = req.user._id;

    if (!vendorId) {
        return sendResponse(
            res,
            false,
            null,
            "Vendor ID is required",
            statusType.BAD_REQUEST
        );
    }

    const existingFeedback = await Feedback.findOne({ userId, vendorId });
    
    return sendResponse(
        res,
        true,
        { hasFeedback: !!existingFeedback, feedback: existingFeedback },
        existingFeedback ? "User has already submitted feedback" : "User can submit feedback",
        statusType.SUCCESS
    );
});

// Rate a vendor
export const rateVendor = asyncHandler(async (req, res) => {
    const { vendorId, rating } = req.body;
    const userId = req.user._id;

    if (!vendorId || !rating || rating < 1 || rating > 5) {
        return sendResponse(res, false, null, "Invalid rating data", statusType.BAD_REQUEST);
    }

    // Check if user already rated
    let existingRating = await Rating.findOne({ userId, vendorId });

    if (existingRating) {
        existingRating.rating = rating;
        await existingRating.save();
    } else {
        existingRating = new Rating({
            userId,
            vendorId,
            rating
        });
        await existingRating.save();
    }

    // Update vendor's average rating
    const ratings = await Rating.find({ vendorId });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Vendor.findByIdAndUpdate(vendorId, {
        averageRating: avgRating.toFixed(1)
    });

    return sendResponse(
        res,
        true,
        existingRating,
        "Rating submitted successfully",
        statusType.CREATED
    );
});

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-pin -refresh_token -token_version");

    if (!user) {
        return sendResponse(res, false, null, "User not found", statusType.NOT_FOUND);
    }

    // Add additional profile data if needed
    const profile = {
        ...user.toObject(),
        memberSince: user.createdAt,
        totalReviews: await Feedback.countDocuments({ userId }),
        totalRatings: await Rating.countDocuments({ userId })
    };

    return sendResponse(res, true, profile, "Profile retrieved successfully", statusType.SUCCESS);
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, phone, image } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (image) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
        return sendResponse(res, false, null, "No data to update", statusType.BAD_REQUEST);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    }).select("-pin -refresh_token -token_version");

    return sendResponse(res, true, updatedUser, "Profile updated successfully", statusType.SUCCESS);
});

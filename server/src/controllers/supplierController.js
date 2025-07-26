// controllers/supplierController.js
import Supplier from "../models/supplier.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";

// Create or update supplier profile
export const createOrUpdateSupplierProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
        deliveryRadius,
        pricePredictionModel,
        // New fields
        companyName,
        businessAddress,
        gstNumber,
        panNumber,
        businessType,
        registrationDate,
        documents
    } = req.body;

    // Validate required fields
    if (
        !deliveryRadius ||
        !deliveryRadius.radiusInKm ||
        !deliveryRadius.coordinates ||
        !deliveryRadius.coordinates.lat ||
        !deliveryRadius.coordinates.lng ||
        !companyName ||
        !businessAddress ||
        !gstNumber ||
        !panNumber ||
        !businessType ||
        !registrationDate
    ) {
        return sendResponse(
            res,
            false,
            null,
            "All required fields are missing",
            statusType.BAD_REQUEST
        );
    }

    const supplierData = {
        userId,
        deliveryRadius,
        companyName,
        businessAddress,
        gstNumber,
        panNumber,
        businessType,
        registrationDate: new Date(registrationDate),
        ...(documents && { documents }),
        ...(pricePredictionModel && { pricePredictionModel })
    };

    const supplier = await Supplier.findOneAndUpdate({ userId }, supplierData, {
        new: true,
        upsert: true
    });

    return sendResponse(
        res,
        true,
        supplier,
        "Supplier profile updated successfully",
        statusType.SUCCESS
    );
});

// Add inventory item
export const addInventoryItem = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { itemName, quantity, unit, price } = req.body;

    if (!itemName || !quantity || !unit || !price) {
        return sendResponse(
            res,
            false,
            null,
            "All inventory fields are required",
            statusType.BAD_REQUEST
        );
    }

    const newItem = {
        itemName,
        quantity,
        unit,
        price,
        lastUpdated: Date.now()
    };

    const supplier = await Supplier.findOneAndUpdate(
        { userId },
        {
            $push: { inventory: newItem },
            $inc: { "dashboardStats.totalItems": 1 },
            $set: { "dashboardStats.lastRestocked": Date.now() }
        },
        { new: true }
    );

    return sendResponse(
        res,
        true,
        supplier,
        "Inventory item added successfully",
        statusType.CREATED
    );
});

// Update inventory item
export const updateInventoryItem = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { itemId, ...updateData } = req.body;

    if (!itemId || Object.keys(updateData).length === 0) {
        return sendResponse(
            res,
            false,
            null,
            "Item ID and update data required",
            statusType.BAD_REQUEST
        );
    }

    const updateFields = {};
    for (const [key, value] of Object.entries(updateData)) {
        updateFields[`inventory.$[elem].${key}`] = value;
    }
    updateFields[`inventory.$[elem].lastUpdated`] = Date.now();

    const supplier = await Supplier.findOneAndUpdate(
        { userId },
        {
            $set: {
                ...updateFields,
                "dashboardStats.lastRestocked": Date.now()
            }
        },
        {
            new: true,
            arrayFilters: [{ "elem._id": itemId }]
        }
    );

    return sendResponse(
        res,
        true,
        supplier,
        "Inventory item updated successfully",
        statusType.SUCCESS
    );
});

// Get supplier dashboard
export const getSupplierDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const supplier = await Supplier.findOne({ userId })
        .select("dashboardStats deliveryRadius")
        .populate({
            path: "orderHistory",
            select: "status totalAmount createdAt",
            options: { sort: { createdAt: -1 }, limit: 5 }
        });

    if (!supplier) {
        return sendResponse(res, false, null, "Supplier profile not found", statusType.NOT_FOUND);
    }

    return sendResponse(res, true, supplier, "Dashboard data retrieved", statusType.SUCCESS);
});

// Get inventory
export const getInventory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const supplier = await Supplier.findOne({ userId }).select("inventory");

    if (!supplier) {
        return sendResponse(res, false, null, "Supplier profile not found", statusType.NOT_FOUND);
    }

    return sendResponse(res, true, supplier.inventory, "Inventory retrieved", statusType.SUCCESS);
});

// Update delivery radius
export const updateDeliveryRadius = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { radiusInKm, coordinates } = req.body;

    if (!radiusInKm || !coordinates || !coordinates.lat || !coordinates.lng) {
        return sendResponse(
            res,
            false,
            null,
            "Radius and coordinates are required",
            statusType.BAD_REQUEST
        );
    }

    const supplier = await Supplier.findOneAndUpdate(
        { userId },
        {
            $set: {
                "deliveryRadius.radiusInKm": radiusInKm,
                "deliveryRadius.coordinates": coordinates
            }
        },
        { new: true }
    );

    return sendResponse(
        res,
        true,
        supplier.deliveryRadius,
        "Delivery radius updated",
        statusType.SUCCESS
    );
});

// Get order history
export const getOrderHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const supplier = await Supplier.findOne({ userId })
        .select("orderHistory")
        .populate({
            path: "orderHistory",
            select: "items totalAmount status createdAt",
            options: { sort: { createdAt: -1 } }
        });

    if (!supplier) {
        return sendResponse(res, false, null, "Supplier profile not found", statusType.NOT_FOUND);
    }

    return sendResponse(
        res,
        true,
        supplier.orderHistory,
        "Order history retrieved",
        statusType.SUCCESS
    );
});

// Add new controller function
export const getSupplierProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const supplier = await Supplier.findOne({ userId }).populate({
        path: "userId",
        select: "name email phone"
    });

    if (!supplier) {
        return sendResponse(res, false, null, "Supplier profile not found", statusType.NOT_FOUND);
    }

    // Format response to match frontend
    const profileResponse = {
        id: supplier._id,
        name: supplier.userId.name,
        email: supplier.userId.email,
        phone: supplier.userId.phone,
        company: supplier.companyName,
        address: supplier.businessAddress,
        gstNumber: supplier.gstNumber,
        panNumber: supplier.panNumber,
        businessType: supplier.businessType,
        registrationDate: supplier.registrationDate,
        deliveryRadius: supplier.deliveryRadius.radiusInKm,
        documents: supplier.documents,
        // Mocked values for frontend
        rating: 4.8,
        totalOrders: 156,
        completedOrders: 142,
        totalRevenue: 2450000
    };

    return sendResponse(
        res,
        true,
        profileResponse,
        "Profile retrieved successfully",
        statusType.SUCCESS
    );
});

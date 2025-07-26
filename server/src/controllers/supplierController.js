import Supplier from "../models/supplier.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";
import InventoryDetail from "../models/inventorydetails.js";
import InventoryItem from "../models/inventoryItem.js";

// Create or update supplier profile
export const createOrUpdateSupplierProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
        deliveryRadius,
        pricePredictionModel,
        companyName,
        businessAddress,
        gstNumber,
        panNumber,
        businessType,
        registrationDate,
        documents
    } = req.body;

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

    // Create new InventoryItem document
    const newItem = new InventoryItem({
        itemName,
        quantity,
        unit,
        price,
        lastUpdated: Date.now()
    });
    await newItem.save();

    // Update supplier with new item reference
    const supplier = await Supplier.findOneAndUpdate(
        { userId },
        {
            $push: { inventory: newItem._id },
            $inc: { "dashboardStats.totalItems": 1 },
            $set: { "dashboardStats.lastRestocked": Date.now() }
        },
        { new: true }
    );

    return sendResponse(
        res,
        true,
        newItem, // Return the created item
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

    // Add lastUpdated to the updateData
    updateData.lastUpdated = Date.now();

    // Update the InventoryItem document directly
    const updatedItem = await InventoryItem.findByIdAndUpdate(itemId, updateData, { new: true });

    if (!updatedItem) {
        return sendResponse(res, false, null, "Inventory item not found", statusType.NOT_FOUND);
    }

    // Update supplier's last restocked time
    await Supplier.findOneAndUpdate(
        { userId },
        { $set: { "dashboardStats.lastRestocked": Date.now() } }
    );

    return sendResponse(
        res,
        true,
        updatedItem,
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

    // Find supplier and populate inventory items
    const supplier = await Supplier.findOne({ userId }).select("inventory").populate({
        path: "inventory",
        model: "InventoryItem"
    });

    if (!supplier) {
        return sendResponse(res, false, null, "Supplier profile not found", statusType.NOT_FOUND);
    }

    const inventoryItems = supplier.inventory;
    if (inventoryItems.length === 0) {
        return sendResponse(res, true, [], "Inventory retrieved", statusType.SUCCESS);
    }

    // Get inventory details for these items
    const inventoryItemIds = inventoryItems.map((item) => item._id);
    const inventoryDetails = await InventoryDetail.find({
        productId: { $in: inventoryItemIds }
    });

    // Create a map for quick lookup: productId -> details
    const detailsMap = new Map();
    inventoryDetails.forEach((detail) => {
        const key = detail.productId.toString();
        if (!detailsMap.has(key)) {
            detailsMap.set(key, detail);
        }
    });

    // Merge inventory items with their details
    const inventoryWithDetails = inventoryItems.map((item) => {
        const itemId = item._id.toString();
        return {
            ...item.toObject(),
            details: detailsMap.get(itemId) || null
        };
    });

    return sendResponse(
        res,
        true,
        inventoryWithDetails,
        "Inventory retrieved with details",
        statusType.SUCCESS
    );
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

// Get supplier profile
export const getSupplierProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const supplier = await Supplier.findOne({ userId }).populate({
        path: "userId",
        select: "name email phone"
    });

    if (!supplier) {
        return sendResponse(res, false, null, "Supplier profile not found", statusType.NOT_FOUND);
    }

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

// Get all suppliers with verified inventory
export const getAllSupplier = asyncHandler(async (req, res) => {
    const allSuppliers = await Supplier.find().lean();

    const processedSuppliers = [];

    for (const supplier of allSuppliers) {
        const inventoryItemIds = supplier.inventory;

        if (!inventoryItemIds || inventoryItemIds.length === 0) {
            supplier.verifiedInventory = [];
            processedSuppliers.push(supplier);
            continue;
        }

        // Get verified inventory detail entries
        const verifiedDetails = await InventoryDetail.find({
            productId: { $in: inventoryItemIds },
            verificationStatus: "verified"
        }).lean();

        const verifiedItemIds = verifiedDetails.map((detail) => detail.productId.toString());

        // Filter inventory to only include verified ones
        const verifiedInventory = await InventoryItem.find({
            _id: { $in: verifiedItemIds }
        }).lean();

        // Append only verified inventory
        supplier.verifiedInventory = verifiedInventory;

        processedSuppliers.push(supplier);
    }

    sendResponse(
        res,
        true,
        processedSuppliers,
        "Suppliers with verified inventory retrieved successfully",
        statusType.OK
    );
});

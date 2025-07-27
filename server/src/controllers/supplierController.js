import Supplier from "../models/supplier.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";
import InventoryDetail from "../models/inventorydetails.js";
import InventoryItem from "../models/inventoryItem.js";
import Order from "../models/Order.js";
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

// Enhanced getSupplierDashboard function
export const getSupplierDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find the supplier
    const supplier = await Supplier.findOne({ userId })
        .select("userId dashboardStats deliveryRadius inventory companyName createdAt")
        .populate({
            path: "inventory",
            model: "InventoryItem",
            select: "itemName quantity unit price lastUpdated"
        });

    if (!supplier) {
        return sendResponse(res, false, null, "Supplier profile not found", statusType.NOT_FOUND);
    }

    // Fetch orders from Order model where supplier = current supplier
    const orders = await Order.find({ supplier: supplier.userId })
        .select(
            "status totalAmount createdAt items deliveryLocation estimatedDelivery actualDelivery"
        )
        .sort({ createdAt: -1 });

    // Fetch inventory verification details
    console.log("Fetching inventory details for supplier:", supplier);
    const inventoryIds = supplier.inventory.map((item) => item._id);
    const inventoryDetails = await InventoryDetail.find({
        productId: { $in: inventoryIds }
    });

    // Time periods for analysis
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Order Statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const acceptedOrders = orders.filter((order) => order.status === "accepted").length;
    const completedOrders = orders.filter((order) => order.status === "delivered").length;
    const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
    const rejectedOrders = orders.filter((order) => order.status === "rejected").length;

    // Revenue Statistics
    const totalRevenue = orders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.totalAmount, 0);

    const monthlyRevenue = orders
        .filter(
            (order) => order.status === "delivered" && new Date(order.createdAt) >= startOfMonth
        )
        .reduce((sum, order) => sum + order.totalAmount, 0);

    const weeklyRevenue = orders
        .filter((order) => order.status === "delivered" && new Date(order.createdAt) >= startOfWeek)
        .reduce((sum, order) => sum + order.totalAmount, 0);

    // Recent Orders (last 30 days)
    const recentOrders = orders.filter((order) => new Date(order.createdAt) >= thirtyDaysAgo);

    const recentOrdersRevenue = recentOrders
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.totalAmount, 0);

    // Inventory Statistics
    const inventory = supplier.inventory || [];
    const totalInventoryItems = inventory.length;
    const totalInventoryValue = inventory.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
    );

    const lowStockItems = inventory.filter((item) => item.quantity < 10).length;
    const outOfStockItems = inventory.filter((item) => item.quantity === 0).length;

    // Most valuable inventory items (top 5)
    const topValueItems = inventory
        .map((item) => ({
            name: item.itemName,
            value: item.quantity * item.price,
            quantity: item.quantity,
            price: item.price
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Recently updated inventory (last 7 days)
    const recentlyUpdatedItems = inventory.filter(
        (item) => new Date(item.lastUpdated) >= sevenDaysAgo
    ).length;

    // Order Status Distribution
    const orderStatusDistribution = {
        pending: pendingOrders,
        accepted: acceptedOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        rejected: rejectedOrders
    };

    // Performance Metrics
    const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0;

    const cancellationRate =
        totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(2) : 0;

    const averageOrderValue = completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(2) : 0;

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= monthStart && orderDate <= monthEnd;
        });

        const monthRevenue = monthOrders
            .filter((order) => order.status === "delivered")
            .reduce((sum, order) => sum + order.totalAmount, 0);

        monthlyTrend.push({
            month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            orders: monthOrders.length,
            revenue: monthRevenue,
            completedOrders: monthOrders.filter((order) => order.status === "delivered").length
        });
    }

    // Recent order activity (last 5 orders)
    const recentOrderActivity = orders.slice(0, 5).map((order) => ({
        id: order._id,
        status: order.status,
        amount: order.totalAmount,
        itemCount: order.items.length,
        date: order.createdAt,
        estimatedDelivery: order.estimatedDelivery
    }));

    // Delivery Performance
    const deliveredOrders = orders.filter(
        (order) => order.status === "delivered" && order.estimatedDelivery && order.actualDelivery
    );

    const onTimeDeliveries = deliveredOrders.filter(
        (order) => new Date(order.actualDelivery) <= new Date(order.estimatedDelivery)
    ).length;

    const onTimeDeliveryRate =
        deliveredOrders.length > 0
            ? ((onTimeDeliveries / deliveredOrders.length) * 100).toFixed(2)
            : 0;

    // Verification status from inventoryDetails
    const verifiedItems = inventoryDetails.filter(
        (detail) => detail.verificationStatus === "verified"
    ).length;

    const pendingVerificationItems = inventoryDetails.filter(
        (detail) => detail.verificationStatus === "pending"
    ).length;

    // Build comprehensive dashboard response
    const dashboardData = {
        // Basic Info
        supplierInfo: {
            name: supplier.companyName,
            deliveryRadius: supplier.deliveryRadius,
            joinedDate: supplier.createdAt
        },

        // Order Statistics
        orderStats: {
            total: totalOrders,
            pending: pendingOrders,
            accepted: acceptedOrders,
            completed: completedOrders,
            cancelled: cancelledOrders,
            rejected: rejectedOrders,
            recentOrders: recentOrders.length,
            distribution: orderStatusDistribution
        },

        // Revenue Statistics
        revenueStats: {
            total: totalRevenue,
            monthly: monthlyRevenue,
            weekly: weeklyRevenue,
            recent30Days: recentOrdersRevenue,
            averageOrderValue: parseFloat(averageOrderValue)
        },

        // Inventory Statistics
        inventoryStats: {
            totalItems: totalInventoryItems,
            totalValue: totalInventoryValue,
            lowStockItems,
            outOfStockItems,
            recentlyUpdated: recentlyUpdatedItems,
            verifiedItems,
            pendingVerification: pendingVerificationItems,
            topValueItems
        },

        // Performance Metrics
        performanceMetrics: {
            completionRate: parseFloat(completionRate),
            cancellationRate: parseFloat(cancellationRate),
            onTimeDeliveryRate: parseFloat(onTimeDeliveryRate),
            averageOrderValue: parseFloat(averageOrderValue)
        },

        // Trends and Analytics
        trends: {
            monthlyTrend,
            recentActivity: recentOrderActivity
        },

        // Quick Actions Data
        quickStats: {
            pendingOrders,
            lowStockAlerts: lowStockItems,
            pendingVerifications: pendingVerificationItems,
            todaysRevenue: orders
                .filter((order) => {
                    const today = new Date();
                    const orderDate = new Date(order.createdAt);
                    return (
                        order.status === "delivered" &&
                        orderDate.toDateString() === today.toDateString()
                    );
                })
                .reduce((sum, order) => sum + order.totalAmount, 0)
        },

        lastUpdated: new Date()
    };

    return sendResponse(
        res,
        true,
        dashboardData,
        "Enhanced dashboard data retrieved successfully",
        statusType.SUCCESS
    );
});

// Helper function to convert array to status object
const convertToObject = (array) => {
    return array.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
    }, {});
};

// Helper function to fill missing months
const processMonthlyData = (monthlyData) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return { month: date.getMonth() + 1, revenue: 0 };
    });

    monthlyData.forEach((item) => {
        const entry = last30Days.find((e) => e.month === item._id);
        if (entry) entry.revenue = item.revenue;
    });

    return last30Days.reverse();
};

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
    try {
        // Get all suppliers with their inventory references
        const suppliers = await Supplier.find()
            .populate({
                path: 'inventory',
                model: 'InventoryItem',
                select: 'itemName quantity unit price lastUpdated'
            })
            .lean();

        // Process each supplier to include verification status
        const processedSuppliers = await Promise.all(suppliers.map(async (supplier) => {
            if (!supplier.inventory || supplier.inventory.length === 0) {
                return {
                    ...supplier,
                    verifiedInventory: []
                };
            }

            // Get verification status for each inventory item
            const verifiedDetails = await InventoryDetail.find({
                productId: { $in: supplier.inventory.map(item => item._id) },
                verificationStatus: "verified"
            }).lean();

            const verifiedItemIds = new Set(
                verifiedDetails.map(detail => detail.productId.toString())
            );

            // Filter and mark verified items
            const verifiedInventory = supplier.inventory.map(item => ({
                ...item,
                isVerified: verifiedItemIds.has(item._id.toString())
            }));

            return {
                ...supplier,
                inventory: verifiedInventory,
                verifiedInventory: verifiedInventory.filter(item => item.isVerified)
            };
        }));

        sendResponse(
            res,
            true,
            processedSuppliers,
            "Suppliers with inventory retrieved successfully",
            statusType.OK
        );
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        sendResponse(
            res,
            false,
            null,
            "Failed to retrieve suppliers",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

// vendorController.js
import Vendor from "../models/vendor.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";
import Order from "../models/Order.js";
import Group from "../models/group.js";

const updateVendorProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Use _id to be consistent with getVendorProfile
    const updateData = req.body;

    if (!userId) {
        return sendResponse(res, false, null, "User ID is missing", statusType.BAD_REQUEST);
    }

    // Find vendor or create new
    let vendor = await Vendor.findOne({ userId });
    const isNew = !vendor;
    
    if (isNew) {
        vendor = new Vendor({ userId });
    }

    // Update fields with validation
    const validFields = [
        'businessName', 'businessType', 'operatingHours', 'daysOfOperation',
        'cuisineTypes', 'paymentMethods', 'preferredDeliveryTime',
        'canOrderSupply', 'operatingLocations'
    ];
    
    validFields.forEach(key => {
        if (updateData[key] !== undefined) {
            vendor[key] = updateData[key];
        }
    });

    // Validate and normalize operatingLocations
    if (Array.isArray(vendor.operatingLocations)) {
        vendor.operatingLocations = vendor.operatingLocations.map(loc => ({
            name: loc.name || "Unnamed Location",
            address: loc.address || "",
            primary: loc.primary || false
        }));
        
        // Ensure at least one primary location
        if (vendor.operatingLocations.length > 0 && 
            !vendor.operatingLocations.some(loc => loc.primary)) {
            vendor.operatingLocations[0].primary = true;
        }
    } else {
        vendor.operatingLocations = [{
            name: "Main Location",
            address: "",
            primary: true
        }];
    }

    try {
        await vendor.save();
        return sendResponse(
            res,
            true,
            vendor,
            isNew ? "Vendor profile created" : "Vendor profile updated",
            statusType.SUCCESS
        );
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return sendResponse(res, false, null, messages.join(', '), statusType.BAD_REQUEST);
        }
        throw error;
    }
});

const getVendorProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        let vendor = await Vendor.findOne({ userId })
            .populate({
                path: 'orderHistory',
                model: Order,
                select: '-items -__v'
            })
            .populate({
                path: 'groupIds',
                model: Group,  // Use imported Group model
                select: 'name description'
            })
            .lean();

        // If vendor profile doesn't exist, return a default structure
        if (!vendor) {
            const defaultVendorProfile = {
                businessName: `${req.user.name}'s Business`,
                businessType: "",
                operatingHours: { start: "08:00", end: "20:00" },
                daysOfOperation: ["mon", "tue", "wed", "thu", "fri", "sat"],
                cuisineTypes: [],
                paymentMethods: [],
                preferredDeliveryTime: "09:00",
                canOrderSupply: true,
                operatingLocations: [],
                verified: false,
                verificationDocuments: []
            };

            return sendResponse(
                res,
                true,
                {
                    ...defaultVendorProfile,
                    user: {
                        name: req.user.name,
                        phone: req.user.phone,
                        email: req.user.email,
                        avatar: req.user.avatar
                    }
                },
                "Vendor profile not found, returning default structure",
                statusType.SUCCESS
            );
        }

        // If vendor profile exists, return it with user data
        const vendorProfile = {
            ...vendor,
            user: {
                name: req.user.name,
                phone: req.user.phone,
                email: req.user.email,
                avatar: req.user.avatar
            }
        };

        return sendResponse(
            res,
            true,
            vendorProfile,
            "Vendor profile retrieved successfully",
            statusType.SUCCESS
        );
    } catch (error) {
        return sendResponse(
            res,
            false,
            null,
            error.message || "Error retrieving vendor profile",
            statusType.INTERNAL_SERVER_ERROR
        );
    }
});

const getVendorDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log("hello")
    // Find vendor and populate necessary fields
    const vendor = await Vendor.findOne({ userId })
        .select('businessName businessType verified cuisineTypes paymentMethods operatingHours daysOfOperation preferredDeliveryTime operatingLocations averageDailyCustomers monthlyRevenue')
        .lean();

    if (!vendor) {
        return sendResponse(res, false, null, "Vendor not found", statusType.NOT_FOUND);
    }

    // Get order statistics
    const totalOrders = await Order.countDocuments({ vendor: vendor._id });
    const pendingOrders = await Order.countDocuments({ 
        vendor: vendor._id,
        status: { $in: ["pending", "accepted", "packed", "shipped"] } 
    });

    // Prepare dashboard data
    const dashboardData = {
        totalOrders,
        pendingOrders,
        dailyCustomers: vendor.averageDailyCustomers || 0,
        monthlyRevenue: vendor.monthlyRevenue || 0,
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        verified: vendor.verified,
        cuisineTypes: vendor.cuisineTypes || [],
        paymentMethods: vendor.paymentMethods || [],
        operatingHours: vendor.operatingHours,
        daysOfOperation: vendor.daysOfOperation || [],
        preferredDeliveryTime: vendor.preferredDeliveryTime,
        operatingLocations: vendor.operatingLocations || []
    };

    return sendResponse(res, true, dashboardData, "Dashboard data retrieved", statusType.SUCCESS);
});

export { updateVendorProfile, getVendorProfile,getVendorDashboard };
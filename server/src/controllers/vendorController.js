// vendorController.js
import Vendor from "../models/vendor.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResonse.js";
import { statusType } from "../utils/statusType.js";

const updateVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updateData = req.body;
  
  if (req.user.role !== "vendor") {
    return sendResponse(
      res,
      false,
      null,
      "Only vendors can update vendor profiles",
      statusType.FORBIDDEN
    );
  }

  // Try to find existing vendor
  let vendor = await Vendor.findOne({ userId });

  // If vendor doesn't exist, create a new one
  if (!vendor) {
    try {
      // Create new vendor profile with the provided data
      vendor = new Vendor({
        userId,
        ...updateData
      });
      
      // Set default business name if not provided
      if (!vendor.businessName) {
        vendor.businessName = `${req.user.name}'s Business`;
      }
      
      // Save the new vendor
      const newVendor = await vendor.save();
      
      return sendResponse(
        res,
        true,
        newVendor,
        "Vendor profile created successfully",
        statusType.CREATED
      );
    } catch (error) {
      // Handle creation errors
      let errorMessage = "Vendor creation failed";
      if (error.errors) {
        const firstError = Object.values(error.errors)[0];
        errorMessage = firstError.message;
      } else {
        errorMessage = error.message;
      }
      
      return sendResponse(
        res,
        false,
        null,
        errorMessage,
        statusType.BAD_REQUEST
      );
    }
  }

  // Validate operatingLocations primary flag for existing vendors
  if (updateData.operatingLocations) {
    const primaryLocations = updateData.operatingLocations.filter(
      (loc) => loc.primary
    );
    if (primaryLocations.length > 1) {
      return sendResponse(
        res,
        false,
        null,
        "Only one location can be primary",
        statusType.BAD_REQUEST
      );
    }
  }

  // Update allowed fields
  const allowedUpdates = [
    "businessName",
    "businessType",
    "operatingLocations",
    "operatingHours",
    "daysOfOperation",
    "cuisineTypes",
    "averageDailyCustomers",
    "monthlyRevenue",
    "preferredDeliveryTime",
    "canOrderSupply",
    "paymentMethods",
    "verificationDocuments",
  ];

  // Apply updates
  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      vendor[field] = updateData[field];
    }
  });

  try {
    const updatedVendor = await vendor.save();
    return sendResponse(
      res,
      true,
      updatedVendor,
      "Vendor profile updated successfully",
      statusType.SUCCESS
    );
  } catch (error) {
    // Handle validation errors
    let errorMessage = "Validation failed";
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      errorMessage = firstError.message;
    } else {
      errorMessage = error.message;
    }
    
    return sendResponse(
      res,
      false,
      null,
      errorMessage,
      statusType.BAD_REQUEST
    );
  }
});

export { updateVendorProfile };
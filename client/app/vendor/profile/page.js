"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CalendarDays,
  Truck,
  Store,
  ShoppingCart,
  Box,
  Utensils,
  ShieldCheck,
  Edit,
  Save,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { getVendorProfile, updateVendorProfile } from "@/services/vendorServices";
import { Toaster, toast } from "react-hot-toast";

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getVendorProfile();
        if (data) {
          setProfile(data.data);
          setEditForm(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch vendor profile:', err);
        toast.error(err.message || 'Failed to load vendor profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const formatBusinessType = (type) => {
    const types = {
      cart: "Food Cart",
      stall: "Food Stall",
      food_truck: "Food Truck",
      small_shop: "Small Shop"
    };
    return types[type] || type;
  };

  const formatDay = (day) => {
    const days = {
      sun: "Sunday",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday"
    };
    return days[day] || day;
  };

  const formatCuisine = (cuisine) => {
    return cuisine.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(profile);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedProfile = await updateVendorProfile(editForm);
      setProfile(updatedProfile.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parentField, field, value) => {
    setEditForm(prev => ({
      ...prev,
      [parentField]: { ...prev[parentField], [field]: value }
    }));
  };

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = [...editForm.operatingLocations];
    updatedLocations[index][field] = value;
    handleInputChange("operatingLocations", updatedLocations);
  };

  const addNewLocation = () => {
    const newLocations = [
      ...editForm.operatingLocations,
      { name: "", address: "", primary: false }
    ];
    handleInputChange("operatingLocations", newLocations);
  };

  const removeLocation = (index) => {
    const updatedLocations = editForm.operatingLocations.filter((_, i) => i !== index);
    handleInputChange("operatingLocations", updatedLocations);
  };

  const setPrimaryLocation = (index) => {
    const updatedLocations = editForm.operatingLocations.map((loc, i) => ({
      ...loc,
      primary: i === index
    }));
    handleInputChange("operatingLocations", updatedLocations);
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Failed to load vendor profile
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-2 ">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your vendor account information and business details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.user?.name?.charAt(0) || "V"}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                  {profile.user?.name || "Vendor Name"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {profile.businessName || "Business Name"}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    profile.verified
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {profile.verified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{profile.monthlyRevenue ? (profile.monthlyRevenue / 1000).toFixed(1) + "K" : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Daily Customers</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {profile.averageDailyCustomers || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Supply Ordering</span>
                  <span className={`font-semibold ${
                    profile.canOrderSupply 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {profile.canOrderSupply ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <CalendarDays className="w-5 h-5" />
                  <span>Order History</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Truck className="w-5 h-5" />
                  <span>Delivery Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Utensils className="w-5 h-5" />
                  <span>Menu Management</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Personal Information
                </h3>
                {/* {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )} */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.user?.name || ""}
                      onChange={(e) => handleInputChange("user", {
                        ...editForm.user,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{profile.user?.name || "N/A"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.user?.phone || ""}
                      onChange={(e) => handleInputChange("user", {
                        ...editForm.user,
                        phone: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{profile.user?.phone || "N/A"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Created
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.businessName || ""}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Store className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{profile.businessName || "N/A"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Type
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.businessType || "cart"}
                      onChange={(e) => handleInputChange("businessType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cart">Food Cart</option>
                      <option value="stall">Food Stall</option>
                      <option value="food_truck">Food Truck</option>
                      <option value="small_shop">Small Shop</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {profile.businessType === 'food_truck' && <Truck className="w-5 h-5 text-blue-500" />}
                      {profile.businessType === 'stall' && <Store className="w-5 h-5 text-blue-500" />}
                      {profile.businessType === 'cart' && <ShoppingCart className="w-5 h-5 text-blue-500" />}
                      {profile.businessType === 'small_shop' && <Box className="w-5 h-5 text-blue-500" />}
                      <span className="text-gray-900 dark:text-white">
                        {formatBusinessType(profile.businessType)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operating Hours
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="time"
                          value={editForm.operatingHours?.start || "08:00"}
                          onChange={(e) => handleNestedChange("operatingHours", "start", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          value={editForm.operatingHours?.end || "20:00"}
                          onChange={(e) => handleNestedChange("operatingHours", "end", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {profile.operatingHours?.start || "08:00"} - {profile.operatingHours?.end || "20:00"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Status
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      profile.verified
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {profile.verified ? "Verified" : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Business Details
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Cuisine Types</h4>
                  {isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["street_food", "north_indian", "south_indian", "chinese", "sweets", "beverages"].map((cuisine) => (
                        <label key={cuisine} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.cuisineTypes?.includes(cuisine)}
                            onChange={(e) => {
                              let updatedTypes = [...(editForm.cuisineTypes || [])];
                              if (e.target.checked) {
                                updatedTypes.push(cuisine);
                              } else {
                                updatedTypes = updatedTypes.filter(type => type !== cuisine);
                              }
                              handleInputChange("cuisineTypes", updatedTypes);
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {formatCuisine(cuisine)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.cuisineTypes?.map((cuisine, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {formatCuisine(cuisine)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Methods</h4>
                  {isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["cash", "upi", "card", "online_wallet"].map((method) => (
                        <label key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.paymentMethods?.includes(method)}
                            onChange={(e) => {
                              let updatedMethods = [...(editForm.paymentMethods || [])];
                              if (e.target.checked) {
                                updatedMethods.push(method);
                              } else {
                                updatedMethods = updatedMethods.filter(m => m !== method);
                              }
                              handleInputChange("paymentMethods", updatedMethods);
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.paymentMethods?.map((method, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                        >
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Delivery Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Delivery Time
                      </label>
                      {isEditing ? (
                        <input
                          type="time"
                          value={editForm.preferredDeliveryTime || "09:00"}
                          onChange={(e) => handleInputChange("preferredDeliveryTime", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile.preferredDeliveryTime || "09:00"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Supply Ordering
                      </label>
                      {isEditing ? (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.canOrderSupply}
                              onChange={(e) => handleInputChange("canOrderSupply", e.target.checked)}
                              className="mr-2 h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              Enable supplies ordering
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            profile.canOrderSupply
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}>
                            {profile.canOrderSupply ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Operating Locations</h4>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={addNewLocation}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Location
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {profile.operatingLocations?.map((location, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-700 dark:text-gray-300">
                            Location #{index + 1}
                          </h5>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeLocation(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Location Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.operatingLocations[index]?.name || ""}
                                onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-gray-900 dark:text-white">
                                  {location.name}
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Address
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.operatingLocations[index]?.address || ""}
                                onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-gray-900 dark:text-white">
                                  {location.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing && (
                          <div className="mt-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="primary-location"
                                checked={location.primary}
                                onChange={() => setPrimaryLocation(index)}
                                className="mr-2"
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                Set as primary location
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
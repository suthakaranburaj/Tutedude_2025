// Dashboard.jsx
'use client'

import { useEffect,useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MapPin, Clock, CalendarDays, Utensils, Truck, Store, ShoppingCart, ShieldCheck, CreditCard, Box, User } from 'lucide-react'
import { getVendorDashboard } from "@/services/vendorServices";
import { Toaster, toast } from "react-hot-toast";
export default function Dashboard() {
  const router = useRouter()
  
     const [error, setError] = useState(null);
   const [vendorData, setVendorData] = useState(null);
    const [loading, setLoading] = useState(true);
  

    useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await getVendorDashboard();
        setVendorData(data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  // Helper functions
  const formatBusinessType = (type) => {
    const types = {
      cart: "Food Cart",
      stall: "Food Stall",
      food_truck: "Food Truck",
      small_shop: "Small Shop"
    }
    return types[type] || type
  }
  
  const formatDay = (day) => {
    const days = {
      sun: "Sunday",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday"
    }
    return days[day] || day
  }
  
  const formatCuisine = (cuisine) => {
    const cuisines = {
      north_indian: "North Indian",
      south_indian: "South Indian",
      chinese: "Chinese",
      street_food: "Street Food",
      sweets: "Sweets",
      beverages: "Beverages"
    }
    return cuisines[cuisine] || cuisine
  }
  
    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (!vendorData) {
        return <div>Error loading dashboard data</div>;
    }
  // Main component JSX
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* <Navbar /> */}
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {vendorData.businessName}! 👋
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your street food business and track your performance.
            </p>
          </div>

          {/* Business Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Orders
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vendorData.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-600 rounded-md flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending Orders
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vendorData.pendingOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Daily Customers
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vendorData.dailyCustomers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-600 rounded-md flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Monthly Revenue
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                   ₹{vendorData.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Business Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</h3>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {vendorData.businessName}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</h3>
                    <div className="flex items-center mt-1">
                      {vendorData.businessType === 'food_truck' && (
                        <Truck className="w-5 h-5 text-blue-500 mr-2" />
                      )}
                      {vendorData.businessType === 'stall' && (
                        <Store className="w-5 h-5 text-blue-500 mr-2" />
                      )}
                      {vendorData.businessType === 'cart' && (
                        <ShoppingCart className="w-5 h-5 text-blue-500 mr-2" />
                      )}
                      {vendorData.businessType === 'small_shop' && (
                        <Box className="w-5 h-5 text-blue-500 mr-2" />
                      )}
                      <span className="text-gray-900 dark:text-white">
                        {formatBusinessType(vendorData.businessType)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification Status</h3>
                    <div className="flex items-center mt-1">
                      {vendorData.verified ? (
                        <>
                          <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-green-600 dark:text-green-400">Verified</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="text-yellow-600 dark:text-yellow-400">Pending Verification</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cuisine Types</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vendorData.cuisineTypes.map((cuisine, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {formatCuisine(cuisine)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Methods</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vendorData.paymentMethods.map((method, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                      >
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Operating Details */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Operating Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating Hours</h3>
                  <div className="flex items-center mt-1">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-900 dark:text-white">
                      {vendorData.operatingHours.start} - {vendorData.operatingHours.end}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Days of Operation</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                    {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                      <div 
                        key={day} 
                        className={`p-2 rounded text-center text-sm ${
                          vendorData.daysOfOperation.includes(day)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {formatDay(day).slice(0, 3)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Delivery Time</h3>
                  <div className="flex items-center mt-1">
                    <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-900 dark:text-white">
                      {vendorData.preferredDeliveryTime}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating Locations</h3>
                  <div className="space-y-2 mt-2">
                    {vendorData.operatingLocations.map((location, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded border ${
                          location.primary 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start">
                          <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            location.primary ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                          }`} />
                          <div className="ml-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {location.name} {location.primary && (
                                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                  Primary
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {location.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                  <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Update Schedule</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                  <Utensils className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Menu</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Order Supplies</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Verification</span>
              </button>
            </div>
          </div>
          
          {/* Feedback Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Customer Feedback
                </h2>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Share this QR code with your customers to collect feedback
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="bg-white p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                    <span className="text-gray-500">QR Code</span>
                  </div>
                </div>
                <button className="mt-2 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
// Dashboard.jsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VendorDashboard from './VendorDashboard'

export default function Dashboard() {
  const router = useRouter()
  
  // Complete dummy vendor user object
  const dummyVendor = {
    _id: 'vendor_123456',
    name: 'Street Food Vendor',
    email: 'vendor@streetfood.com',
    phone: '+919876543210',
    role: 'vendor',
    image: '/vendor-avatar.jpg',
    createdAt: new Date().toISOString(),
  }

  // Dummy vendor profile data
  const dummyVendorProfile = {
    businessName: "Tasty Bites Food Truck",
    businessType: "food_truck",
    operatingLocations: [
      {
        name: "Downtown Square",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        address: "123 Main Street, Downtown",
        primary: true
      },
      {
        name: "Central Park",
        coordinates: { lat: 12.9352, lng: 77.6245 },
        address: "456 Park Avenue, City Center",
        primary: false
      }
    ],
    operatingHours: {
      start: "08:00",
      end: "20:00"
    },
    daysOfOperation: ["mon", "tue", "wed", "thu", "fri", "sat"],
    cuisineTypes: ["street_food", "beverages", "sweets"],
    averageDailyCustomers: 120,
    monthlyRevenue: 15000,
    preferredDeliveryTime: "09:30",
    canOrderSupply: true,
    paymentMethods: ["cash", "upi", "card"],
    verified: false,
    verificationDocuments: [],
    dashboard: {
      totalOrders: 45,
      pendingOrders: 3
    },
    orderHistory: [],
    feedbackQRCode: "/qr-code.png"
  }

  // Remove all redirects and just show the dashboard
  return <VendorDashboard user={dummyVendor} vendorData={dummyVendorProfile} />
}
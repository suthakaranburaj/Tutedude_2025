// src/app/supplier/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  CheckCircle,
  Clock,
  MapPin,
  PlusCircle,
  RefreshCw,
  ArrowRight,
  Truck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

export default function SupplierDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockDashboardData = {
    stats: {
      totalItems: 42,
      pendingOrders: 5,
      completedOrders: 28,
      lowStockItems: 3,
    },
    inventory: [
      { name: "Rice", quantity: 120, unit: "kg" },
      { name: "Oil", quantity: 35, unit: "L" },
      { name: "Flour", quantity: 85, unit: "kg" },
      { name: "Vegetables", quantity: 20, unit: "kg" },
      { name: "Spices", quantity: 15, unit: "kg" },
    ],
    orderHistory: [
      {
        id: "ORD001",
        date: "2023-10-15",
        items: 8,
        amount: 2450,
        status: "completed",
      },
      {
        id: "ORD002",
        date: "2023-10-17",
        items: 5,
        amount: 1820,
        status: "pending",
      },
      {
        id: "ORD003",
        date: "2023-10-18",
        items: 12,
        amount: 3760,
        status: "completed",
      },
      {
        id: "ORD004",
        date: "2023-10-19",
        items: 3,
        amount: 890,
        status: "pending",
      },
      {
        id: "ORD005",
        date: "2023-10-20",
        items: 7,
        amount: 2100,
        status: "completed",
      },
    ],
    deliveryRadius: {
      radiusInKm: 15,
      coordinates: { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
    },
    salesData: [
      { month: "Jun", sales: 4000 },
      { month: "Jul", sales: 7800 },
      { month: "Aug", sales: 10200 },
      { month: "Sep", sales: 9800 },
      { month: "Oct", sales: 12500 },
    ],
  };

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Items",
      value: dashboardData.stats.totalItems,
      icon: Package,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      change: "+12%",
    },
    {
      title: "Pending Orders",
      value: dashboardData.stats.pendingOrders,
      icon: ShoppingBag,
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
      change: "-3%",
    },
    {
      title: "Completed Orders",
      value: dashboardData.stats.completedOrders,
      icon: CheckCircle,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      change: "+18%",
    },
    {
      title: "Low Stock Items",
      value: dashboardData.stats.lowStockItems,
      icon: Clock,
      color: "bg-gradient-to-r from-rose-500 to-pink-500",
      change: "+2%",
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Supplier Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your inventory, orders, and business performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </h3>
                    <span
                      className={`text-xs ${
                        stat.title === "Low Stock Items"
                          ? "text-rose-500"
                          : "text-green-500"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Monthly Sales
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData.salesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee"
                    strokeOpacity={0.2}
                  />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--foreground)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#4f46e5"
                    fill="url(#colorSales)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#4f46e5"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Inventory Levels
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.inventory}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee"
                    strokeOpacity={0.2}
                  />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--foreground)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                    formatter={(value) => [`${value} units`, "Quantity"]}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dashboardData.orderHistory.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.items}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{order.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions and Delivery */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {/* <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                  <div className="flex items-center">
                    <PlusCircle className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Add Inventory Item
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                </button> */}

                <Link href="/supplier/inventory">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                    <div className="flex items-center">
                      <RefreshCw className="w-5 h-5 text-emerald-600 mr-3" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Update Stock
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                  </button>
                </Link>

                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-600 transition-colors">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-amber-600 mr-3" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Manage Deliveries
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-600" />
                </button>
              </div>
            </div>

            {/* Delivery Radius */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Delivery Radius
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Your current service area
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                  Edit
                </button>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mt-4">
                <div className="flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-rose-500" />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {dashboardData.deliveryRadius.radiusInKm} km radius
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Around your location
                    </p>
                  </div>
                </div>

                {/* Simple map visualization */}
                <div className="relative mt-4 h-40 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-blue-500 border-opacity-50 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-4 border-blue-500 border-opacity-70 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Lat: {dashboardData.deliveryRadius.coordinates.lat}, Lng:{" "}
                    {dashboardData.deliveryRadius.coordinates.lng}
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

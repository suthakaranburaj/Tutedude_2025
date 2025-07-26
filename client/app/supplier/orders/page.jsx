"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Download,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for demonstration
  const mockOrders = [
    {
      id: "ORD001",
      customerName: "Rahul Sharma",
      customerPhone: "+91 98765 43210",
      items: [
        { name: "Basmati Rice", quantity: 5, unit: "kg", price: 85 },
        { name: "Sunflower Oil", quantity: 2, unit: "L", price: 120 },
      ],
      totalAmount: 665,
      status: "completed",
      orderDate: "2023-10-15",
      deliveryDate: "2023-10-16",
      deliveryAddress: "123 Main St, Bangalore, KA 560001",
      paymentMethod: "Online",
    },
    {
      id: "ORD002",
      customerName: "Priya Patel",
      customerPhone: "+91 87654 32109",
      items: [
        { name: "Wheat Flour", quantity: 3, unit: "kg", price: 45 },
        { name: "Garam Masala", quantity: 1, unit: "kg", price: 200 },
      ],
      totalAmount: 335,
      status: "pending",
      orderDate: "2023-10-17",
      deliveryDate: null,
      deliveryAddress: "456 Park Ave, Bangalore, KA 560002",
      paymentMethod: "Cash on Delivery",
    },
    {
      id: "ORD003",
      customerName: "Amit Kumar",
      customerPhone: "+91 76543 21098",
      items: [
        { name: "Fresh Tomatoes", quantity: 2, unit: "kg", price: 60 },
        { name: "Basmati Rice", quantity: 10, unit: "kg", price: 85 },
        { name: "Sunflower Oil", quantity: 3, unit: "L", price: 120 },
      ],
      totalAmount: 1200,
      status: "in_transit",
      orderDate: "2023-10-18",
      deliveryDate: "2023-10-19",
      deliveryAddress: "789 Lake Rd, Bangalore, KA 560003",
      paymentMethod: "Online",
    },
    {
      id: "ORD004",
      customerName: "Sneha Reddy",
      customerPhone: "+91 65432 10987",
      items: [
        { name: "Wheat Flour", quantity: 2, unit: "kg", price: 45 },
      ],
      totalAmount: 90,
      status: "cancelled",
      orderDate: "2023-10-19",
      deliveryDate: null,
      deliveryAddress: "321 Garden St, Bangalore, KA 560004",
      paymentMethod: "Online",
    },
    {
      id: "ORD005",
      customerName: "Vikram Singh",
      customerPhone: "+91 54321 09876",
      items: [
        { name: "Garam Masala", quantity: 2, unit: "kg", price: 200 },
        { name: "Fresh Tomatoes", quantity: 1, unit: "kg", price: 60 },
      ],
      totalAmount: 460,
      status: "completed",
      orderDate: "2023-10-20",
      deliveryDate: "2023-10-21",
      deliveryAddress: "654 Hill View, Bangalore, KA 560005",
      paymentMethod: "Cash on Delivery",
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in_transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_transit":
        return <Truck className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderStats = () => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === "completed").length;
    const pending = orders.filter(o => o.status === "pending").length;
    const inTransit = orders.filter(o => o.status === "in_transit").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, completed, pending, inTransit, cancelled, totalRevenue };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage all customer orders, delivery status, and payments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Orders
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Completed
                </p>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.completed}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Pending
                </p>
                <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {stats.pending}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg p-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  In Transit
                </p>
                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.inTransit}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-3">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹{stats.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status.replace("_", " ").charAt(0).toUpperCase() + order.status.replace("_", " ").slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.orderDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
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
  X,
  Edit,
} from "lucide-react";
import { getSupplierOrders, updateOrderStatus } from "@/services/order";
import { Toaster, toast } from "react-hot-toast";

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewOrder, setPreviewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getSupplierOrders();
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const truncateId = (id) => {
    if (id.length <= 8) return id;
    return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-CA");
  };

  const handleUpdateStatus = async () => {
    if (!editOrder || !newStatus) return;

    try {
      await updateOrderStatus({ id: editOrder._id, status: newStatus });
      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === editOrder._id ? { ...order, status: newStatus } : order
        )
      );
      setEditOrder(null);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryLocation?.address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "pending") {
      matchesStatus = order.status === "pending" || order.status === "accepted";
    } else {
      matchesStatus = order.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "accepted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
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
      case "accepted":
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
    const completed = orders.filter((o) => o.status === "completed").length;
    const pending = orders.filter(
      (o) => o.status === "pending" || o.status === "accepted"
    ).length;
    const inTransit = orders.filter((o) => o.status === "in_transit").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
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
      <Toaster position="top-right" />
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
                  placeholder="Search orders by ID, address, or vendor..."
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
                <option value="pending">Pending & Accepted</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Reset
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
                    Delivery Address
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
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {truncateId(order._id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.deliveryLocation?.address || "N/A"}
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
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <span className="mr-1 flex items-center">
                            {getStatusIcon(order.status)}
                          </span>
                          {order.status
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPreviewOrder(order)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditOrder(order);
                              setNewStatus(order.status);
                            }}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Order Modal */}
      {previewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h3>
                <button
                  onClick={() => setPreviewOrder(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Order ID
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {previewOrder._id}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Vendor
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {previewOrder.vendor?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Order Date
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(previewOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </h4>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      previewOrder.status
                    )}`}
                  >
                    {previewOrder.status
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Delivery Address
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {previewOrder.deliveryLocation?.address || "N/A"}
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Items
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewOrder.items.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          ₹{item.priceAtOrder.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          ₹{(item.quantity * item.priceAtOrder).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Total: ₹{previewOrder.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Order Status
                </h3>
                <button
                  onClick={() => setEditOrder(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditOrder(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

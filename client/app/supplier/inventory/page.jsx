"use client";

import { useState, useEffect } from "react";
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { addInventoryItem } from "@/services/supplier";

export default function SupplierInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ itemName: "", quantity: "", unit: "kg", price: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Mock data for demonstration
  const mockInventory = [
    {
      id: 1,
      name: "Basmati Rice",
      category: "Grains",
      quantity: 120,
      unit: "kg",
      price: 85,
      minStock: 20,
      supplier: "Local Farm",
      lastUpdated: "2023-10-20",
    },
    {
      id: 2,
      name: "Sunflower Oil",
      category: "Oils",
      quantity: 35,
      unit: "L",
      price: 120,
      minStock: 10,
      supplier: "Oil Co.",
      lastUpdated: "2023-10-19",
    },
    {
      id: 3,
      name: "Wheat Flour",
      category: "Grains",
      quantity: 85,
      unit: "kg",
      price: 45,
      minStock: 15,
      supplier: "Mill Corp",
      lastUpdated: "2023-10-18",
    },
    {
      id: 4,
      name: "Fresh Tomatoes",
      category: "Vegetables",
      quantity: 20,
      unit: "kg",
      price: 60,
      minStock: 5,
      supplier: "Local Market",
      lastUpdated: "2023-10-20",
    },
    {
      id: 5,
      name: "Garam Masala",
      category: "Spices",
      quantity: 15,
      unit: "kg",
      price: 200,
      minStock: 3,
      supplier: "Spice World",
      lastUpdated: "2023-10-17",
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setInventory(mockInventory);
      setLoading(false);
    }, 800);
  }, []);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= minStock) return "low";
    if (quantity <= minStock * 2) return "medium";
    return "good";
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      const payload = {
        itemName: addForm.itemName,
        quantity: Number(addForm.quantity),
        unit: addForm.unit,
        price: Number(addForm.price),
      };
      const res = await addInventoryItem(payload);
      // Optionally, fetch inventory from backend here. For now, update locally:
      setInventory((prev) => [
        {
          id: Date.now(),
          name: payload.itemName,
          category: "-",
          quantity: payload.quantity,
          unit: payload.unit,
          price: payload.price,
          minStock: 5,
          supplier: "-",
          lastUpdated: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      setIsAddModalOpen(false);
      setAddForm({ itemName: "", quantity: "", unit: "kg", price: "" });
    } catch (err) {
      setAddError(err?.error || "Failed to add item");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Add Inventory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setIsAddModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Inventory Item</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={addForm.itemName}
                  onChange={handleAddInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={addForm.quantity}
                  onChange={handleAddInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                <select
                  name="unit"
                  value={addForm.unit}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={addForm.price}
                  onChange={handleAddInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {addError && <div className="text-red-500 text-sm">{addError}</div>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-60"
                disabled={addLoading}
              >
                {addLoading ? "Adding..." : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your inventory items, track stock levels, and update quantities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Items
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {inventory.length}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Low Stock Items
                </p>
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {inventory.filter(item => getStockStatus(item.quantity, item.minStock) === "low").length}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg p-3">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Value
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₹{inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Categories
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {new Set(inventory.map(item => item.category)).size}
                </h3>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={() => setIsAddModalOpen(true)}
              >
                <PlusCircle className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.quantity, item.minStock);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.supplier}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            stockStatus === "low"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : stockStatus === "medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
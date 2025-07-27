'use client'

import { useEffect, useState } from 'react';
import { Package, User, Phone, MapPin, BadgeCheck, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { getAllInventoryItems } from '@/services/agent.js';
import VerificationDialog from '@/components/VerificationDialog';

export default function GetAllProducts() {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleVerificationClick = (item) => {
        setSelectedProduct(item);
        setIsDialogOpen(true);
    };

    const handleVerificationComplete = async () => {
  try {
    setIsLoading(true);
    const response = await getAllInventoryItems();
    
    if (response.status && response.data) {
      setInventoryItems(response.data);
    } else {
      setError('Failed to refresh inventory items');
    }
  } catch (err) {
    setError('Error refreshing inventory: ' + err.message);
  } finally {
    setIsLoading(false);
  }
};
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await getAllInventoryItems();
                console.log('Response from getAllInventoryItems:', response);

                if (response.status && response.data) {
                    setInventoryItems(response.data);
                } else {
                    setError('Failed to load inventory items');
                }
            } catch (err) {
                setError('Error fetching inventory: ' + err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format date to a readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                            Available Inventory Items
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Browse through products from all suppliers. Each item comes with detailed information about the product and supplier.
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-center">
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-700 dark:text-red-400">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Inventory Items Grid */}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inventoryItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    {/* Product Header */}
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-5">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-white truncate">
                                                {item.itemName}
                                            </h2>
                                            <div className="bg-white/20 p-2 rounded-lg">
                                                <Package className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-5">
                                        <div className="grid grid-cols-2 gap-4 mb-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Quantity</span>
                                                <span className="font-medium text-lg">
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
                                                <span className="font-medium text-lg text-green-600 dark:text-green-400">
                                                    ₹{item.price}/unit
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Updated</span>
                                                <span className="font-medium text-sm">
                                                    {formatDate(item.lastUpdated)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                                                <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                                                    Available
                                                </span>
                                            </div>
                                        </div>

                                        {/* Supplier Information */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-5">
                                            <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                <User className="w-4 h-4 mr-2" /> Supplier Information
                                            </h3>

                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                    <span className="font-medium">{item.supplier.name}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                    <span>{item.supplier.phone}</span>
                                                </div>

                                                <div className="flex items-start">
                                                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Delivery Radius</p>
                                                        <p className="text-sm">
                                                            {item.supplier.deliveryRadius.radiusInKm} km around location
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            ({item.supplier.coordinates.lat.toFixed(4)}, {item.supplier.coordinates.lng.toFixed(4)})
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleVerificationClick(item)}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-xl flex items-center justify-center transition-all duration-300"
                                        >
                                            <BadgeCheck className="w-5 h-5 mr-2" />
                                            Verification
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && inventoryItems.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                No Inventory Items Found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                                Currently there are no inventory items available. Please check back later.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {isDialogOpen && selectedProduct && (
                <VerificationDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    productId={selectedProduct._id}
                    onVerificationComplete={handleVerificationComplete}
                />
            )}
        </div>


    );


}
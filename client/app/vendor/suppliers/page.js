"use client";
import { useState, useEffect } from "react";
import {
    Package,
    MapPin,
    ChevronRight,
    Calendar,
    ArrowLeft,
    Plus,
    Minus,
    ShoppingCart,
    Check,
    Building,
    X,
} from "lucide-react";
import { createOrder, getAllSupplier } from "@/services/supplier";

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list");
    const [cart, setCart] = useState([]);
    const [notification, setNotification] = useState(null);
    const [deliveryLocation, setDeliveryLocation] = useState({
        address: "",
        lat: null,
        lng: null,
    });
    const [specialInstructions, setSpecialInstructions] = useState("");

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setDeliveryLocation((prev) => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }

        const fetchSuppliers = async () => {
            try {
                const response = await getAllSupplier();
                if (response.status && response.data.length > 0) {
                    setSuppliers(response.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    const isValidInventoryItem = (item) => {
        return (
            item?.itemName &&
            typeof item?.quantity === "number" &&
            typeof item?.price === "number" &&
            item?.unit
        );
    };

    const handleSupplierSelect = (supplier) => {
        setSelectedSupplier({
            ...supplier,
            inventory: supplier.inventory?.filter(isValidInventoryItem) || []
        });
        setView("detail");
    };

    const handleBackToList = () => {
        setView("list");
        setSelectedSupplier(null);
    };

    const addToCart = (item) => {
        if (!isValidInventoryItem(item)) {
            showNotification("Cannot add invalid item to cart");
            return;
        }

        const existingItemIndex = cart.findIndex(
            (cartItem) => cartItem.itemId === item._id
        );

        if (existingItemIndex >= 0) {
            const existingItem = cart[existingItemIndex];
            if (existingItem.quantity >= item.quantity) {
                showNotification("Cannot add more than available quantity");
                return;
            }
            const updatedCart = [...cart];
            updatedCart[existingItemIndex] = {
                ...updatedCart[existingItemIndex],
                quantity: existingItem.quantity + 1,
            };
            setCart(updatedCart);
        } else {
            if (item.quantity <= 0) {
                showNotification("Item out of stock");
                return;
            }
            setCart([
                ...cart,
                {
                    itemId: item._id,
                    name: item.itemName,
                    price: item.price,
                    unit: item.unit,
                    quantity: 1,
                    maxQuantity: item.quantity,
                    supplierId: selectedSupplier._id,
                    supplierName: selectedSupplier.companyName,
                },
            ]);
        }
        showNotification("Item added to cart");
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter((item) => item.itemId !== itemId));
    };

    const updateCartItemQuantity = (itemId, newQuantity) => {
        const itemIndex = cart.findIndex((item) => item.itemId === itemId);
        if (itemIndex >= 0) {
            const item = cart[itemIndex];
            if (newQuantity <= 0) {
                removeFromCart(itemId);
                return;
            }
            if (newQuantity > item.maxQuantity) {
                showNotification("Cannot add more than available quantity");
                return;
            }
            const updatedCart = [...cart];
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                quantity: newQuantity,
            };
            setCart(updatedCart);
        }
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
        } catch {
            return "N/A";
        }
    };

    const checkOut = async () => {
        // Validate delivery location
        if (!deliveryLocation.address || !deliveryLocation.lat || !deliveryLocation.lng) {
            showNotification("Please enter complete delivery location information");
            return;
        }

        try {
            const orderData = {
                supplierId: selectedSupplier._id,
                items: cart.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    unit: item.unit,
                    supplierId: item.supplierId,
                    supplierName: item.supplierName
                })),
                deliveryLocation: {
                    lat: deliveryLocation.lat,
                    lng: deliveryLocation.lng,
                    address: deliveryLocation.address
                },
                preferredDeliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: 24h from now
                paymentMethod: "upi",
                specialInstructions: specialInstructions || ""
            };

            // In a real app, you would call your API endpoint here
            // console.log("Order data to be submitted:", orderData);

            // Simulate API call
            // showNotification("Order created successfully!");
            // setCart([]);

            // For demo purposes, we're just logging to console
            // In production, you would do:
            const response = await createOrder(cart);
            const result = await response.json();
            if (response.ok) {
              showNotification("Order created successfully!");
              setCart([]);
            } else {
              showNotification(result.message || "Failed to create order");
            }
        } catch (error) {
            showNotification("An error occurred while creating the order");
            console.error("Checkout error:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (view === "detail" && selectedSupplier) {
        return (
            <div className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {notification && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
                            {notification}
                        </div>
                    )}

                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Suppliers
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedSupplier.companyName || "Supplier Inventory"}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {selectedSupplier.businessAddress}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {selectedSupplier.inventory?.length || 0} items
                                    </span>
                                </div>
                                {cart.length > 0 && (
                                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                        <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)} in cart
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="overflow-x-auto mb-8">
                            {selectedSupplier.inventory?.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Item Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Unit
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedSupplier.inventory?.map((item) => {
                                            const cartItem = cart.find((ci) => ci.itemId === item._id);
                                            const availableQuantity = item.quantity - (cartItem?.quantity || 0);

                                            return (
                                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.itemName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {item.quantity} {item.unit}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {item.unit}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        ₹{item.price}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {formatDate(item.lastUpdated)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {cartItem ? (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => updateCartItemQuantity(item._id, cartItem.quantity - 1)}
                                                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                                <span className="font-medium">{cartItem.quantity}</span>
                                                                <button
                                                                    onClick={() => updateCartItemQuantity(item._id, cartItem.quantity + 1)}
                                                                    disabled={availableQuantity <= 0}
                                                                    className={`p-1 ${availableQuantity <= 0 ? "text-gray-400" : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"} rounded`}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => addToCart(item)}
                                                                disabled={item.quantity <= 0}
                                                                className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${item.quantity <= 0 ? "bg-gray-200 dark:bg-gray-700 text-gray-500" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40"}`}
                                                            >
                                                                <ShoppingCart className="w-4 h-4" />
                                                                Add
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No valid inventory items available
                                </div>
                            )}
                        </div>

                        {/* Cart Summary */}
                        {cart.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                                </h3>
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.itemId} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    ₹{item.price} per {item.unit}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateCartItemQuantity(item.itemId, item.quantity - 1)}
                                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartItemQuantity(item.itemId, item.quantity + 1)}
                                                        disabled={item.quantity >= item.maxQuantity}
                                                        className={`p-1 ${item.quantity >= item.maxQuantity ? "text-gray-400" : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"} rounded`}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.itemId)}
                                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Information Form */}
                                <div className="mt-6 space-y-4">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Delivery Information
                                    </h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Delivery Address
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                                            placeholder="Enter full delivery address"
                                            value={deliveryLocation.address}
                                            onChange={(e) => setDeliveryLocation({
                                                ...deliveryLocation,
                                                address: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Special Instructions
                                        </label>
                                        <textarea
                                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                                            placeholder="Any special instructions..."
                                            value={specialInstructions}
                                            onChange={(e) => setSpecialInstructions(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Total Items</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Estimated Total</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={checkOut}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Supplier Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Business Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Business Type</p>
                                        <p className="text-gray-900 dark:text-white">{selectedSupplier.businessType || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">GST Number</p>
                                        <p className="text-gray-900 dark:text-white font-mono">{selectedSupplier.gstNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">PAN Number</p>
                                        <p className="text-gray-900 dark:text-white font-mono">{selectedSupplier.panNumber || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Delivery Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Radius</p>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedSupplier.deliveryRadius?.radiusInKm || 0} km
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedSupplier.deliveryRadius?.coordinates?.lat && selectedSupplier.deliveryRadius?.coordinates?.lng
                                                ? `Lat: ${selectedSupplier.deliveryRadius.coordinates.lat}, Lng: ${selectedSupplier.deliveryRadius.coordinates.lng}`
                                                : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="text-gray-900 dark:text-white">{selectedSupplier.businessAddress || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {suppliers.length} suppliers available
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {suppliers.map((supplier) => (
                            <div
                                key={supplier._id}
                                onClick={() => handleSupplierSelect(supplier)}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {supplier.companyName || `Supplier ${supplier._id.substring(0, 6)}`}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                            <Package className="w-4 h-4" />
                                            <span>{(supplier.inventory?.filter(isValidInventoryItem) || []).length} items</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{supplier.deliveryRadius?.radiusInKm || 0} km radius</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {supplier.registrationDate
                                                    ? new Date(supplier.registrationDate).toLocaleDateString()
                                                    : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Clock, CalendarDays, Truck, Store, ShoppingCart, Box, Utensils, ShieldCheck, X, Plus, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { getVendorProfile, updateVendorProfile } from '@/services/vendorServices'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  
  // Form states
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('cart');
  const [operatingHours, setOperatingHours] = useState({ start: '08:00', end: '20:00' });
  const [daysOfOperation, setDaysOfOperation] = useState(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('09:00');
  const [canOrderSupply, setCanOrderSupply] = useState(true);
  const [operatingLocations, setOperatingLocations] = useState([]);
  const [verified, setVerified] = useState(false);

  const cuisineOptions = ["street_food", "north_indian", "south_indian", "chinese", "sweets", "beverages"];
  const paymentOptions = ["cash", "upi", "card", "online_wallet"];
  const dayOptions = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getVendorProfile();

        if (data) {
          setProfileExists(true);
          setName(data.user?.name || '');
          setEmail(data.user?.email || '');
          setPhone(data.user?.phone || '');
          setBusinessName(data.businessName || '');
          setBusinessType(data.businessType || 'cart');
          setOperatingHours(data.operatingHours || { start: '08:00', end: '20:00' });
          setDaysOfOperation(data.daysOfOperation || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
          setCuisineTypes(data.cuisineTypes || []);
          setPaymentMethods(data.paymentMethods || []);
          setPreferredDeliveryTime(data.preferredDeliveryTime || '09:00');
          setCanOrderSupply(data.canOrderSupply !== undefined ? data.canOrderSupply : true);
          setOperatingLocations(data.operatingLocations || []);
          setCreatedAt(data.createdAt || '');
          setVerified(data.verified || false);
        } else {
          setProfileExists(false);
          setEditMode(true);
        }
      } catch (err) {
        console.error('Failed to fetch vendor profile:', err);
        setError(err.message || 'Failed to load vendor profile');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const locations = operatingLocations.length > 0 
        ? operatingLocations 
        : [{
            name: "Main Location",
            address: "",
            primary: true
          }];
          const hasPrimary = locations.some(loc => loc.primary);
      if (!hasPrimary && locations.length > 0) {
        locations[0].primary = true;
      }
      const vendorUpdate = {
        businessName: businessName || `${name}'s Business`,
        businessType, 
        operatingHours,
        daysOfOperation,
        cuisineTypes,
        paymentMethods,
        preferredDeliveryTime,
        canOrderSupply,
        operatingLocations: locations
      };
    
      await updateVendorProfile(vendorUpdate);
      
      setProfileExists(true);
      setEditMode(false);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = [...operatingLocations];
    updatedLocations[index][field] = value;
    setOperatingLocations(updatedLocations);
  };

  const addNewLocation = () => {
    setOperatingLocations([
      ...operatingLocations,
      {
        name: "",
        address: "",
        primary: false
      }
    ]);
  };

  const removeLocation = (index) => {
    const updatedLocations = [...operatingLocations];
    updatedLocations.splice(index, 1);
    setOperatingLocations(updatedLocations);
  };

  const setPrimaryLocation = (index) => {
    const updatedLocations = operatingLocations.map((loc, i) => ({
      ...loc,
      primary: i === index
    }));
    setOperatingLocations(updatedLocations);
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-2 text-blue-100">Manage your personal and business information</p>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {editMode
                ? (profileExists ? "Edit Profile" : "Create Profile")
                : "Profile Overview"}
            </h2>

            {profileExists && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : editMode ? (
                  "Cancel"
                ) : (
                  "Edit Profile"
                )}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">
                  {name || 'Your Name'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Vendor Account</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      {editMode ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Created
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <Store className="w-5 h-5 mr-2 text-blue-600" />
                    Business Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Business Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{businessName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Business Type
                      </label>
                      {editMode ? (
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="cart">Food Cart</option>
                          <option value="stall">Food Stall</option>
                          <option value="food_truck">Food Truck</option>
                          <option value="small_shop">Small Shop</option>
                        </select>
                      ) : (
                        <div className="flex items-center">
                          {businessType === 'food_truck' && (
                            <Truck className="w-5 h-5 text-blue-500 mr-2" />
                          )}
                          {businessType === 'stall' && (
                            <Store className="w-5 h-5 text-blue-500 mr-2" />
                          )}
                          {businessType === 'cart' && (
                            <ShoppingCart className="w-5 h-5 text-blue-500 mr-2" />
                          )}
                          {businessType === 'small_shop' && (
                            <Box className="w-5 h-5 text-blue-500 mr-2" />
                          )}
                          <span className="text-gray-900 dark:text-white">
                            {formatBusinessType(businessType)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Operating Hours
                      </label>
                      {editMode ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Start</label>
                            <input
                              type="time"
                              value={operatingHours.start}
                              onChange={(e) => setOperatingHours({ ...operatingHours, start: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">End</label>
                            <input
                              type="time"
                              value={operatingHours.end}
                              onChange={(e) => setOperatingHours({ ...operatingHours, end: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-gray-900 dark:text-white">
                            {operatingHours.start} - {operatingHours.end}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Days of Operation
                      </label>
                      {editMode ? (
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                          {dayOptions.map(day => (
                            <div key={day}>
                              <input
                                type="checkbox"
                                id={day}
                                checked={daysOfOperation.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDaysOfOperation([...daysOfOperation, day]);
                                  } else {
                                    setDaysOfOperation(daysOfOperation.filter(d => d !== day));
                                  }
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor={day}
                                className={`block p-2 rounded text-center text-sm cursor-pointer ${daysOfOperation.includes(day)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  }`}
                              >
                                {formatDay(day).slice(0, 3)}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {daysOfOperation.map(day => (
                            <span
                              key={day}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                            >
                              {formatDay(day)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Verification Status
                      </label>
                      <div className="flex items-center">
                        {verified ? (
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
                </div>
              </div>

              <div className="mt-8 bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Utensils className="w-5 h-5 mr-2 text-blue-600" />
                  Business Details
                </h3>

                {editMode ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Cuisine Types</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {cuisineOptions.map((cuisine) => (
                          <label key={cuisine} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={cuisineTypes.includes(cuisine)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCuisineTypes([...cuisineTypes, cuisine]);
                                } else {
                                  setCuisineTypes(cuisineTypes.filter(type => type !== cuisine));
                                }
                              }}
                              className="mr-2 h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatCuisine(cuisine)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Methods</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {paymentOptions.map((method) => (
                          <label key={method} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={paymentMethods.includes(method)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPaymentMethods([...paymentMethods, method]);
                                } else {
                                  setPaymentMethods(paymentMethods.filter(m => m !== method));
                                }
                              }}
                              className="mr-2 h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {method.charAt(0).toUpperCase() + method.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Delivery Preferences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Preferred Delivery Time
                          </label>
                          <input
                            type="time"
                            value={preferredDeliveryTime}
                            onChange={(e) => setPreferredDeliveryTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-start pt-5">
                          <input
                            type="checkbox"
                            id="supply-order"
                            checked={canOrderSupply}
                            onChange={(e) => setCanOrderSupply(e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 rounded"
                          />
                          <label htmlFor="supply-order" className="ml-2 text-gray-700 dark:text-gray-300">
                            Enable supplies ordering
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">Operating Locations</h4>
                        <button
                          type="button"
                          onClick={addNewLocation}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Location
                        </button>
                      </div>

                      <div className="space-y-4">
                        {operatingLocations.map((location, index) => (
                          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <h5 className="font-medium text-gray-700 dark:text-gray-300">
                                Location #{index + 1}
                              </h5>
                              <button
                                type="button"
                                onClick={() => removeLocation(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Location Name
                                </label>
                                <input
                                  type="text"
                                  value={location.name}
                                  onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Address
                                </label>
                                <input
                                  type="text"
                                  value={location.address}
                                  onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  required
                                />
                              </div>
                            </div>

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
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Cuisine Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {cuisineTypes.map((cuisine, index) => (
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
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Methods</h4>
                      <div className="flex flex-wrap gap-2">
                        {paymentMethods.map((method, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                          >
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Operating Locations</h4>
                      <div className="space-y-2">
                        {operatingLocations.map((location, index) => (
                          <div
                            key={index}
                            className="p-3 rounded border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-start">
                              <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                              <div>
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

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Preferences</h4>
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">
                          Preferred delivery time: {preferredDeliveryTime}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-md text-sm ${canOrderSupply
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                          }`}>
                          {canOrderSupply ? "Supplies ordering enabled" : "Supplies ordering disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {editMode && (
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              )}
              {!profileExists && !editMode && (
                <div className="mt-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please complete your vendor profile to start using all features
                  </p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors flex items-center mx-auto"
                  >
                    Create Vendor Profile
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
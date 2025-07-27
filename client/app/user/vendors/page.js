'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Star, MapPin, Clock, Phone, MessageCircle, Heart, CheckCircle } from 'lucide-react'
import { getAllVendors, rateVendor, checkUserFeedback } from '@/services/userServices'

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    cuisine: '',
    minRating: '',
    location: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  })
  const [vendorFeedbackStatus, setVendorFeedbackStatus] = useState({})


  const router = useRouter()

  useEffect(() => {
    fetchVendors()
  }, [filters])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await getAllVendors(filters)
      
      if (response.data) {
        const vendorsData = response.data.data.vendors
        setVendors(vendorsData)
        setPagination({
          page: response.data.data.page,
          pages: response.data.data.pages,
          total: response.data.data.total
        })
        
        // Check feedback status for each vendor
        await checkVendorFeedbackStatus(vendorsData)
      } else {
        setError(response.error || 'Failed to fetch vendors')
      }
    } catch (err) {
      setError('Failed to fetch vendors')
      console.error('Error fetching vendors:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkVendorFeedbackStatus = async (vendorsList) => {
    const feedbackStatus = {}
    
    for (const vendor of vendorsList) {
      try {
        const response = await checkUserFeedback(vendor._id)
        if (response.data) {
          feedbackStatus[vendor._id] = response.data.data.hasFeedback
        }
      } catch (err) {
        console.error(`Error checking feedback for vendor ${vendor._id}:`, err)
        feedbackStatus[vendor._id] = false
      }
    }
    
    setVendorFeedbackStatus(feedbackStatus)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }



  const getCuisineTypeLabel = (type) => {
    const labels = {
      'north_indian': 'North Indian',
      'south_indian': 'South Indian',
      'chinese': 'Chinese',
      'street_food': 'Street Food',
      'sweets': 'Sweets',
      'beverages': 'Beverages'
    }
    return labels[type] || type
  }

  const getBusinessTypeLabel = (type) => {
    const labels = {
      'cart': 'Food Cart',
      'stall': 'Food Stall',
      'food_truck': 'Food Truck',
      'small_shop': 'Small Shop'
    }
    return labels[type] || type
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Vendors
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find and explore local food vendors in your area
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Cuisine Filter */}
            <select
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Cuisines</option>
              <option value="north_indian">North Indian</option>
              <option value="south_indian">South Indian</option>
              <option value="chinese">Chinese</option>
              <option value="street_food">Street Food</option>
              <option value="sweets">Sweets</option>
              <option value="beverages">Beverages</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ cuisine: '', minRating: '', location: '', page: 1, limit: 10 })}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Vendors Grid */}
        {vendors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No vendors found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div 
                onClick={() => router.push(`/user/vendors/${vendor._id}`)}
                key={vendor._id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Vendor Image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  {vendor.userId?.image ? (
                    <img
                      src={vendor.userId.image}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-gray-400 dark:text-gray-600">
                      {vendor.businessName?.charAt(0) || 'V'}
                    </div>
                  )}
                </div>

                {/* Vendor Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {vendor.businessName || 'Unnamed Vendor'}
                    </h3>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">
                      {renderStars(parseFloat(vendor.averageRating || 0))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {vendor.averageRating || '0'} ({Math.floor(Math.random() * 100) + 10} reviews)
                    </span>
                  </div>

                  {/* Business Type & Cuisine */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {getBusinessTypeLabel(vendor.businessType)}
                    </span>
                    {vendor.cuisineTypes?.map((cuisine, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                        {getCuisineTypeLabel(cuisine)}
                      </span>
                    ))}
                  </div>

                  {/* Location */}
                  {vendor.operatingLocations?.length > 0 && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {vendor.operatingLocations.find(loc => loc.primary)?.name || vendor.operatingLocations[0]?.name}
                      </span>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {vendor.operatingHours && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {vendor.operatingHours.start} - {vendor.operatingHours.end}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {vendorFeedbackStatus[vendor._id] ? (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Already Reviewed
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/user/feedback?vendorId=${vendor._id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Rate & Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 border rounded-lg ${
                    pagination.page === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  )
} 
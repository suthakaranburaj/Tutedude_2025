'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, MessageCircle, Star, MapPin, Clock, CheckCircle, Image, X } from 'lucide-react'
import { addFeedback, getAllVendors, checkUserFeedback } from '@/services/userServices'

export default function FeedbackPage() {
  const [vendor, setVendor] = useState(null)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [images, setImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [vendors, setVendors] = useState([])
  const [showVendorSelect, setShowVendorSelect] = useState(false)
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false)
  const [existingFeedback, setExistingFeedback] = useState(null)

  const router = useRouter()


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vendorId = params.get("vendorId");
    if (vendorId) {
      fetchVendorDetails(vendorId);
    } else {
      fetchVendors();
      setShowVendorSelect(true);
    }
  }, []);


  const fetchVendorDetails = async () => {
    try {
      setLoading(true)
      const response = await getAllVendors({ limit: 100 }) // Get all vendors to find the specific one
      
      if (response.data) {
        const foundVendor = response.data.data.vendors.find(v => v._id === vendorId)
        if (foundVendor) {
          setVendor(foundVendor)
          // Check if user has already submitted feedback for this vendor
          await checkExistingFeedback(vendorId)
        } else {
          setError('Vendor not found')
        }
      } else {
        setError(response.error || 'Failed to fetch vendor details')
      }
    } catch (err) {
      setError('Failed to fetch vendor details')
      console.error('Error fetching vendor details:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkExistingFeedback = async (vendorId) => {
    try {
      const response = await checkUserFeedback(vendorId)
      if (response.data) {
        setHasExistingFeedback(response.data.data.hasFeedback)
        setExistingFeedback(response.data.data.feedback)
      }
    } catch (err) {
      console.error('Error checking existing feedback:', err)
    }
  }

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await getAllVendors({ limit: 50 })
      
      if (response.data) {
        setVendors(response.data.data.vendors)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!vendor || !comment.trim() || rating === 0) {
      setError('Please select a vendor, provide feedback, and give a rating')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      
      const response = await addFeedback(vendor._id, comment.trim(), rating, images)
      
      if (response.data) {
        setSuccess(true)
        setComment('')
        setRating(0)
        setImages([])
        setImagePreview([])
        setTimeout(() => {
          router.push('/user/vendors')
        }, 2000)
      } else {
        setError(response.error || 'Failed to submit feedback')
      }
    } catch (err) {
      setError('Failed to submit feedback')
      console.error('Error submitting feedback:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const selectVendor = async (selectedVendor) => {
    setVendor(selectedVendor)
    setShowVendorSelect(false)
    setError('')
    // Check if user has already submitted feedback for this vendor
    await checkExistingFeedback(selectedVendor._id)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      setError('You can upload a maximum of 5 images')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreview(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreview.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreview(newPreviews)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className="text-2xl hover:scale-110 transition-transform"
        >
          <Star 
            className={`w-8 h-8 ${
              i <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`} 
          />
        </button>
      )
    }
    return stars
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Submit Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your experience and help vendors improve their service
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-600 dark:text-green-400">
                Feedback submitted successfully! Redirecting to vendors page...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Vendor Selection Modal */}
        {showVendorSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select a Vendor
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    onClick={() => selectVendor(vendor)}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {vendor.businessName || 'Unnamed Vendor'}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full mr-2">
                        {getBusinessTypeLabel(vendor.businessType)}
                      </span>
                    </div>
                    {vendor.operatingLocations?.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{vendor.operatingLocations[0]?.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => router.push('/user/vendors')}
                className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected Vendor Info */}
        {vendor && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-4">
              {/* Vendor Image */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                {vendor.userId?.image ? (
                  <img
                    src={vendor.userId.image}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-xl font-bold text-gray-400 dark:text-gray-600">
                    {vendor.businessName?.charAt(0) || 'V'}
                  </div>
                )}
              </div>

              {/* Vendor Details */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {vendor.businessName || 'Unnamed Vendor'}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    {getBusinessTypeLabel(vendor.businessType)}
                  </span>
                  {vendor.cuisineTypes?.map((cuisine, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      {getCuisineTypeLabel(cuisine)}
                    </span>
                  ))}
                </div>

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {vendor.operatingLocations?.length > 0 && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{vendor.operatingLocations.find(loc => loc.primary)?.name || vendor.operatingLocations[0]?.name}</span>
                    </div>
                  )}
                  {vendor.operatingHours && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{vendor.operatingHours.start} - {vendor.operatingHours.end}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Change Vendor Button */}
              <button
                onClick={() => setShowVendorSelect(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Existing Feedback Alert */}
        {hasExistingFeedback && existingFeedback && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  You have already submitted feedback for this vendor
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="mb-2">
                    <strong>Your Rating:</strong> {existingFeedback.rating} stars
                  </p>
                  <p className="mb-2">
                    <strong>Your Comment:</strong> {existingFeedback.comment}
                  </p>
                  {existingFeedback.images && existingFeedback.images.length > 0 && (
                    <div>
                      <strong>Your Images:</strong>
                      <div className="flex gap-2 mt-2">
                        {existingFeedback.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Feedback image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs mt-2">
                    Submitted on {new Date(existingFeedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {vendor && !hasExistingFeedback && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              {/* Rating Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Your Rating *
                </label>
                <div className="flex justify-center mb-2">
                  <div className="flex space-x-2">
                    {renderStars(rating)}
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
                </p>
              </div>

              {/* Feedback Text */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this vendor. What did you like? What could be improved?"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your feedback helps vendors improve their service and helps other customers make informed decisions.
                </p>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Image className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Maximum 5 images (JPG, PNG, GIF)
                    </p>
                  </label>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview ({imagePreview.length}/5)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !comment.trim() || rating === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tips Section */}
        {vendor && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Tips for Great Feedback
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Be specific about what you liked or didn't like
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Mention food quality, service, cleanliness, and value for money
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Provide constructive suggestions for improvement
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Include photos of the food, ambiance, or any issues you encountered
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Give an honest rating based on your overall experience
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Keep your feedback respectful and helpful
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 
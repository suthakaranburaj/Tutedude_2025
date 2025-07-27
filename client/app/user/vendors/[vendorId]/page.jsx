"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Clock, MessageCircle } from "lucide-react";
import { getVendorById, getVendorFeedback } from "@/services/userServices";
import FeedbackCard from "@/components/FeedbackCard";

export default function VendorPage() {
  const { vendorId } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchVendorDetails();
    fetchFeedback();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await getVendorById(vendorId);
      if (response.data) {
        setVendor(response.data.data);
      } else {
        setError(response.error || "Failed to fetch vendor details");
      }
    } catch (err) {
      setError("Failed to fetch vendor details");
    }
  };

  const fetchFeedback = async (page = 1) => {
    try {
      const response = await getVendorFeedback(vendorId, page);
      console.log("Feedback response:", response);
      if (response.data) {
        setFeedback(response.data.data.feedback);
        setPagination({
          page: response.data.data.page,
          pages: response.data.data.pages,
          total: response.data.data.total,
        });
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchFeedback(newPage);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vendor) {
    return <div>Vendor not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Vendor Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
              {vendor.userId?.image ? (
                <img
                  src={vendor.userId.image}
                  alt={vendor.businessName}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-xl font-bold text-gray-400">
                  {vendor.businessName?.charAt(0) || "V"}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {vendor.businessName || "Unnamed Vendor"}
              </h1>

              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(vendor.averageRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {vendor.averageRating || "0.0"} ({pagination.total} reviews)
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {vendor.operatingLocations?.length > 0 && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{vendor.operatingLocations[0]?.name}</span>
                  </div>
                )}

                {vendor.operatingHours && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {vendor.operatingHours.start} -{" "}
                      {vendor.operatingHours.end}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* <button
              onClick={() =>
                router.push(`/user/feedback/new?vendorId=${vendorId}`)
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Give Review
            </button> */}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Customer Reviews
          </h2>

          {feedback.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <FeedbackCard key={item._id} feedback={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-2 rounded-lg ${
                      pagination.page === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

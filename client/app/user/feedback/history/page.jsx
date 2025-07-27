"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, MessageCircle, ArrowLeft } from "lucide-react";
import { getUserFeedbackHistory } from "@/services/userServices";
import FeedbackCard from "@/components/FeedbackCard";

export default function FeedbackHistoryPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const router = useRouter();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getUserFeedbackHistory(page);
      if (response.data) {
        setFeedback(response.data.data.feedback);
        setPagination({
          page: response.data.data.page,
          pages: response.data.data.pages,
          total: response.data.data.total,
        });
      } else {
        setError(response.error || "Failed to fetch feedback");
      }
    } catch (err) {
      setError("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchFeedback(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review history of all vendors you've provided feedback for
          </p>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : feedback.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No feedback submitted yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your reviews will appear here once you submit feedback for vendors
            </p>
            <button
              onClick={() => router.push("/user/vendors")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Browse Vendors
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <FeedbackCard key={item._id} feedback={item} />
            ))}

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
        )}
      </div>
    </div>
  );
}

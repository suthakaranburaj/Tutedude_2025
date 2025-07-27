import { Star, Clock } from "lucide-react";
import Image from "next/image";

export default function FeedbackCard({ feedback }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {feedback.userId?.image ? (
            <img
              src={feedback.userId.image}
              alt="User"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-500 font-bold">
              {feedback.userId?.name?.charAt(0) || "U"}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {feedback.userId?.name || "Anonymous"}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center my-2">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < feedback.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {feedback.rating.toFixed(1)}
            </span>
          </div>

          {/* Comment */}
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            {feedback.comment}
          </p>

          {/* Images */}
          {feedback.images && feedback.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {feedback.images.map((img, idx) => (
                <div key={idx} className="w-24 h-24 relative">
                  <Image
                    src={img}
                    alt={`Feedback image ${idx + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

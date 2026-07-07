import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AiFillStar } from "react-icons/ai";
import { BiBadgeCheck } from "react-icons/bi";
import { FiThumbsUp, FiTrash2 } from "react-icons/fi";

dayjs.extend(relativeTime);

const maskName = (name = "") => {
  if (!name) return "Anonymous";
  const parts = name.split(" ");
  const first = parts[0] || "";
  if (first.length <= 2) return `${first[0] || ""}***`;
  return `${first[0]}${"*".repeat(Math.max(first.length - 1, 2))}`;
};

const ReviewList = ({
  reviews,
  loading,
  onLoadMore,
  canLoadMore,
  onMarkHelpful,
  onDeleteReview,
  currentUser,
}) => {
  if (!reviews?.length && !loading) {
    return (
      <div className="border border-gray-100 rounded-xl p-4 text-sm text-gray-500 bg-white">
        No reviews yet. Be the first to review this product.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm">
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex items-center px-1.5 py-0.5 rounded-md bg-green-600 text-white text-xs font-semibold">
                <span className="mr-0.5">{review.rating}</span>
                <AiFillStar className="w-3.5 h-3.5" />
              </div>
              {review.verified && (
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <BiBadgeCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Buyer
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {review.reviewText}
            </p>
            {Array.isArray(review.images) && review.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {review.images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`review-${idx}`}
                    className="w-14 h-14 object-cover rounded-md border border-gray-200"
                  />
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="font-medium">
                  {maskName(review?.displayName || review?.user?.name)}
                </span>
                <span>•</span>
                <span>{dayjs(review.createdAt).fromNow()}</span>
              </div>
              <div className="flex items-center space-x-3">
                {currentUser?._id === review?.user?._id && (
                  <button
                    type="button"
                    onClick={() => onDeleteReview(review._id)}
                    className="inline-flex items-center space-x-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onMarkHelpful(review)}
                  className="inline-flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <FiThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful</span>
                  <span className="text-[11px]">
                    ({review.helpfulCount || 0})
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canLoadMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load more reviews"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;



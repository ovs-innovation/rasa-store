import React from "react";
import { Button, Input } from "@windmill/react-ui";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const emptyReview = () => ({
  name: "",
  role: "",
  item: "",
  rating: 5,
  comment: "",
  date: "",
  avatar: "",
});

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`w-8 h-8 rounded-lg text-sm font-bold border ${
          star <= value
            ? "bg-amber-100 border-amber-300 text-amber-700"
            : "bg-gray-50 border-gray-200 text-gray-400"
        }`}
      >
        {star}
      </button>
    ))}
  </div>
);

const HomepageCustomerReviewsEditor = ({
  reviews = [],
  section = {},
  onReviewsChange,
  onSectionChange,
  hideSectionToggle = false,
}) => {
  const updateReview = (index, field, value) => {
    const next = reviews.map((review, i) =>
      i === index ? { ...review, [field]: value } : review
    );
    onReviewsChange(next);
  };

  const addReview = () => {
    onReviewsChange([...(reviews || []), emptyReview()]);
  };

  const removeReview = (index) => {
    onReviewsChange(reviews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
            Section label
          </label>
          <Input
            value={section?.eyebrow || ""}
            onChange={(e) => onSectionChange({ ...section, eyebrow: e.target.value })}
            placeholder="Customer Reviews"
            className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
            Section title
          </label>
          <Input
            value={section?.title || ""}
            onChange={(e) => onSectionChange({ ...section, title: e.target.value })}
            placeholder="What Our Customers Say"
            className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
            Section subtitle
          </label>
          <Input
            value={section?.subtitle || ""}
            onChange={(e) => onSectionChange({ ...section, subtitle: e.target.value })}
            placeholder="Real feedback from shoppers..."
            className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        {!hideSectionToggle && (
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 md:col-span-2">
            <input
              type="checkbox"
              checked={section?.enabled !== false}
              onChange={(e) => onSectionChange({ ...section, enabled: e.target.checked })}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            Show reviews section on homepage
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          These reviews appear on the homepage carousel — not product pages.
        </p>
        <Button type="button" onClick={addReview} className="bg-teal-600 hover:bg-teal-700">
          <FiPlus className="mr-2" />
          Add Review
        </Button>
      </div>

      {!reviews?.length && (
        <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
          No homepage reviews yet. Click &quot;Add Review&quot; to create one.
        </div>
      )}

      {reviews?.map((review, index) => (
        <div
          key={index}
          className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-900/40"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">
              Review {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeReview(index)}
              className="text-red-500 hover:text-red-600 p-1"
              title="Remove review"
            >
              <FiTrash2 size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Input
              value={review.name || ""}
              onChange={(e) => updateReview(index, "name", e.target.value)}
              placeholder="Customer name"
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
            />
            <Input
              value={review.role || ""}
              onChange={(e) => updateReview(index, "role", e.target.value)}
              placeholder="City / role (e.g. Mumbai)"
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
            />
            <Input
              value={review.item || ""}
              onChange={(e) => updateReview(index, "item", e.target.value)}
              placeholder="Product name"
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
            />
            <Input
              value={review.date || ""}
              onChange={(e) => updateReview(index, "date", e.target.value)}
              placeholder="Date (e.g. June 2025)"
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">
              Rating
            </label>
            <StarPicker
              value={Number(review.rating) || 5}
              onChange={(rating) => updateReview(index, "rating", rating)}
            />
          </div>

          <textarea
            value={review.comment || ""}
            onChange={(e) => updateReview(index, "comment", e.target.value)}
            rows={3}
            placeholder="Review text shown on homepage"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2 outline-none focus:border-teal-500/50"
          />
        </div>
      ))}
    </div>
  );
};

export default HomepageCustomerReviewsEditor;

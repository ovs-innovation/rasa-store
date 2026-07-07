import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Textarea,
  Select,
  Label,
} from "@windmill/react-ui";
import { FiStar, FiX } from "react-icons/fi";
import ProductServices from "@/services/ProductServices";
import ReviewServices from "@/services/ReviewServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const formatText = (value, fallback = "") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.en) return value.en;
    const firstValue = Object.values(value)[0];
    return typeof firstValue === "string" ? firstValue : fallback;
  }
  return String(value);
};

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-1 rounded-md hover:bg-amber-50 transition-colors"
      >
        <FiStar
          size={22}
          className={
            star <= value
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300 fill-gray-200"
          }
        />
      </button>
    ))}
    <span className="ml-2 text-sm font-semibold text-gray-600">{value}/5</span>
  </div>
);

const ReviewFormModal = ({ isOpen, onClose, review, onSuccess }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const isEdit = Boolean(review?._id);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    displayName: "",
    rating: 5,
    reviewText: "",
    verified: true,
    reply: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      productId: review?.product?._id || review?.product || "",
      displayName:
        review?.displayName || formatText(review?.user?.name, ""),
      rating: review?.rating || 5,
      reviewText: review?.reviewText || "",
      verified: review?.verified !== false,
      reply: review?.reply || "",
    });
  }, [isOpen, review]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      try {
        const res = await ProductServices.getAllProducts({
          page: 1,
          limit: 200,
        });
        if (!cancelled) {
          setProducts(res?.products || []);
        }
      } catch (_) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productId) {
      window.alert("Please select a product.");
      return;
    }
    if (!form.displayName.trim()) {
      window.alert("Please enter customer name.");
      return;
    }
    if (!form.reviewText.trim()) {
      window.alert("Please enter review text.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productId: form.productId,
        displayName: form.displayName.trim(),
        rating: Number(form.rating),
        reviewText: form.reviewText.trim(),
        verified: form.verified,
        reply: form.reply.trim(),
      };

      if (isEdit) {
        await ReviewServices.updateReview(review._id, payload);
      } else {
        await ReviewServices.createReview(payload);
      }

      onSuccess?.(
        isEdit ? "Review updated successfully!" : "Review added successfully!"
      );
      onClose();
    } catch (err) {
      window.alert(
        err?.response?.data?.message || err?.message || "Failed to save review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader className="flex items-center justify-between">
        <span>{isEdit ? "Update Review" : "Add Review"}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiX />
        </button>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <div>
            <Label>
              <span>Product *</span>
            </Label>
            <Select
              disabled={isEdit || loadingProducts}
              value={form.productId}
              onChange={(e) => updateField("productId", e.target.value)}
              className="mt-1"
            >
              <option value="">
                {loadingProducts ? "Loading products..." : "Select product"}
              </option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {showingTranslateValue(product.title)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>
              <span>Customer Name *</span>
            </Label>
            <Input
              className="mt-1"
              value={form.displayName}
              onChange={(e) => updateField("displayName", e.target.value)}
              placeholder="e.g. Rahul S."
            />
          </div>

          <div>
            <Label>
              <span>Rating *</span>
            </Label>
            <div className="mt-1">
              <StarPicker
                value={Number(form.rating)}
                onChange={(rating) => updateField("rating", rating)}
              />
            </div>
          </div>

          <div>
            <Label>
              <span>Review Text *</span>
            </Label>
            <Textarea
              className="mt-1"
              rows="4"
              value={form.reviewText}
              onChange={(e) => updateField("reviewText", e.target.value)}
              placeholder="Write the customer review..."
            />
          </div>

          <div>
            <Label>
              <span>Store Reply</span>
            </Label>
            <Textarea
              className="mt-1"
              rows="3"
              value={form.reply}
              onChange={(e) => updateField("reply", e.target.value)}
              placeholder="Optional reply from store admin"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => updateField("verified", e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            Mark as verified purchase
          </label>
        </ModalBody>

        <ModalFooter className="justify-end gap-2">
          <Button layout="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Review"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ReviewFormModal;

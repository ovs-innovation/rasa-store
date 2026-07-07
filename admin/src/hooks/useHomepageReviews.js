import { useCallback, useEffect, useState } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import SettingServices from "@/services/SettingServices";

const normalizeCustomizationSetting = (res) => {
  if (!res || typeof res !== "object") return { setting: {} };
  if (res.setting && typeof res.setting === "object" && !res.rasaHomepage && !res.navbar) {
    return { setting: res.setting };
  }
  return { setting: res };
};

export const DEFAULT_HOME_REVIEWS = [
  {
    name: "Arjun M.",
    role: "Mumbai",
    item: "Soleste Tote Bag",
    rating: 5,
    comment:
      "Ordered the bag and it arrived in 2 days. Packaging was insane — felt like opening a luxury gift. Quality is 10/10, no complaints at all.",
    date: "June 2025",
    avatar: "",
  },
  {
    name: "Priya S.",
    role: "Delhi",
    item: "Nikke Runner",
    rating: 5,
    comment:
      "The sneakers I got are exactly as shown — clean colourway, perfect fit. Rasa Store has become my go-to for finding pieces that actually match the pictures.",
    date: "May 2025",
    avatar: "",
  },
  {
    name: "Vikram T.",
    role: "Hyderabad",
    item: "Balanse Low-Top",
    rating: 5,
    comment:
      "These guys know their stuff. Every item is curated properly — no random filler products. My sneakers are absolutely fire!",
    date: "May 2025",
    avatar: "",
  },
  {
    name: "Sneha R.",
    role: "Chennai",
    item: "Heritage Shoulder Bag",
    rating: 5,
    comment:
      "Customer service was super responsive. Had a small query about sizing and they replied within minutes. The bag is absolutely gorgeous.",
    date: "April 2025",
    avatar: "",
  },
];

export const DEFAULT_REVIEWS_SECTION = {
  enabled: true,
  eyebrow: "Customer Reviews",
  title: "What Our Customers Say",
  subtitle: "Real feedback from shoppers who bought from Rasa Store.",
};

const sanitizeCustomerReview = (review = {}) => ({
  name: String(review?.name || "").trim(),
  role: String(review?.role || "").trim(),
  item: String(review?.item || "").trim(),
  rating: Math.min(5, Math.max(1, Number(review?.rating) || 5)),
  comment: String(review?.comment || "").trim(),
  date: String(review?.date || "").trim(),
  avatar: String(review?.avatar || "").trim(),
});

export const sanitizeCustomerReviews = (reviews = []) => {
  const list = Array.isArray(reviews) ? reviews : [];
  return list.map(sanitizeCustomerReview).filter((review) => review.comment);
};

export const sanitizeReviewsSection = (section = {}) => ({
  enabled: section?.enabled !== false,
  eyebrow: String(section?.eyebrow ?? DEFAULT_REVIEWS_SECTION.eyebrow).trim(),
  title: String(section?.title ?? DEFAULT_REVIEWS_SECTION.title).trim(),
  subtitle: String(section?.subtitle ?? DEFAULT_REVIEWS_SECTION.subtitle).trim(),
});

const useHomepageReviews = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerReviews, setCustomerReviews] = useState(DEFAULT_HOME_REVIEWS);
  const [reviewsSection, setReviewsSection] = useState(DEFAULT_REVIEWS_SECTION);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await SettingServices.getStoreCustomizationSetting();
      const { setting } = normalizeCustomizationSetting(res);
      const saved = setting?.rasaHomepage || {};

      setCustomerReviews(
        sanitizeCustomerReviews(
          saved.customerReviews?.length ? saved.customerReviews : DEFAULT_HOME_REVIEWS
        )
      );
      setReviewsSection(
        sanitizeReviewsSection(saved.reviewsSection || DEFAULT_REVIEWS_SECTION)
      );
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to load homepage reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    try {
      setSaving(true);
      const res = await SettingServices.getStoreCustomizationSetting();
      const { setting: baseSetting } = normalizeCustomizationSetting(res);
      const savedHomepage = baseSetting?.rasaHomepage || {};

      await SettingServices.updateStoreCustomizationSetting({
        name: "storeCustomizationSetting",
        setting: {
          ...baseSetting,
          rasaHomepage: {
            ...savedHomepage,
            customerReviews: sanitizeCustomerReviews(customerReviews),
            reviewsSection: sanitizeReviewsSection(reviewsSection),
          },
        },
      });

      notifySuccess("Homepage reviews saved");
      await load();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save homepage reviews");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    customerReviews,
    setCustomerReviews,
    reviewsSection,
    setReviewsSection,
    save,
    reload: load,
  };
};

export default useHomepageReviews;

import { useEffect, useState, useCallback } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import SettingServices from "@/services/SettingServices";

const DEFAULT_RASA_HOMEPAGE = {
  heroSlides: [
    { title: "Aero Phantom Lux", subtitle: "Phantom Lux", image: "/shoes1.png", link: "/search?category=footwear", brand: "Aero" },
    { title: "Rasa Apex Duffle", subtitle: "Apex Duffle", image: "/bag1.png", link: "/search?category=bags", brand: "Rasa" },
  ],
  instagramPosts: [],
  trendingProductIds: [],
  newArrivalProductIds: [],
  categoryBanners: [],
  brandsSectionEnabled: true,
  customerReviews: [
    {
      name: "Aarav S.",
      role: "Verified Buyer",
      item: "Sneakers",
      rating: 5,
      comment: "Great quality and fast delivery. Exactly what I ordered — will shop again.",
      avatar: "",
    },
    {
      name: "Riya P.",
      role: "Verified Buyer",
      item: "Crossbody Bag",
      rating: 5,
      comment: "Love the bag! Packaging was neat and the product matched the photos perfectly.",
      avatar: "",
    },
    {
      name: "Vikram M.",
      role: "Repeat Customer",
      item: "Streetwear Drop",
      rating: 5,
      comment: "Best prices I've found online. WhatsApp support was super helpful with sizing.",
      avatar: "",
    },
  ],
  reviewsSection: {
    enabled: true,
    eyebrow: "Reviews",
    title: "What Customers Say",
    subtitle: "Real feedback from shoppers who bought from Rasa Store.",
  },
  footerIntro:
    "Your one-stop shop for affordable sneakers, bags, and the latest styles.",
  sectionOrder: ["Hero", "Brands", "New Arrival", "Trending", "Categories", "Reviews"],
};

const normalizeCustomizationSetting = (res) => {
  const raw = res?.[0] || res || {};
  if (raw?.setting && typeof raw.setting === "object") {
    return { id: raw._id || null, setting: raw.setting };
  }
  return { id: raw._id || null, setting: raw };
};

const useRasaHomepage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState(null);
  const [homepage, setHomepage] = useState(DEFAULT_RASA_HOMEPAGE);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await SettingServices.getStoreCustomizationSetting();
      const { id, setting } = normalizeCustomizationSetting(res);
      setSettingId(id);
      const merged = {
        ...DEFAULT_RASA_HOMEPAGE,
        ...(setting?.rasaHomepage || {}),
      };
      setHomepage(merged);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to load homepage settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (path, value) => {
    setHomepage((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      const res = await SettingServices.getStoreCustomizationSetting();
      const { setting: baseSetting } = normalizeCustomizationSetting(res);
      const payload = {
        name: "storeCustomizationSetting",
        setting: {
          ...baseSetting,
          rasaHomepage: homepage,
        },
      };
      if (settingId) {
        await SettingServices.updateStoreCustomizationSetting(payload);
      } else {
        await SettingServices.addStoreCustomizationSetting(payload);
      }
      notifySuccess("Homepage settings saved");
      await load();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    homepage,
    setHomepage,
    updateField,
    save,
  };
};

export default useRasaHomepage;

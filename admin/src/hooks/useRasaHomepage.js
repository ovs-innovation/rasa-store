import { useEffect, useState, useCallback } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import SettingServices from "@/services/SettingServices";

const DEFAULT_RASA_HOMEPAGE = {
  heroSlides: [],
  instagramPosts: [],
  trendingProductIds: [],
  newArrivalProductIds: [],
  categoryBanners: [],
  brandsSectionEnabled: true,
  sectionOrder: ["Hero", "Brands", "New Arrival", "Trending", "Categories", "Newsletter"],
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
      const doc = res?.[0] || res;
      setSettingId(doc?._id || null);
      const merged = {
        ...DEFAULT_RASA_HOMEPAGE,
        ...(doc?.setting?.rasaHomepage || {}),
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
      const doc = res?.[0] || res;
      const baseSetting = doc?.setting || {};
      const payload = {
        name: "storeCustomizationSetting",
        setting: {
          ...baseSetting,
          rasaHomepage: homepage,
        },
      };
      if (doc?._id) {
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

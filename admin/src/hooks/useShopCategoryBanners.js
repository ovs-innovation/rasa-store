import { useCallback, useEffect, useState } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import SettingServices from "@/services/SettingServices";

export const DEFAULT_CATEGORY_BANNERS = [
  { type: "footwear", title: "Shoes", slug: "footwear", image: "/shoes1.png" },
  { type: "bags", title: "Bags", slug: "bags", image: "/bag1.png" },
];

export const CATEGORY_META = {
  footwear: {
    label: "Shoes",
    description: "Homepage, mobile menu, and navigation.",
    defaults: DEFAULT_CATEGORY_BANNERS[0],
  },
  bags: {
    label: "Bags",
    description: "Homepage, mobile menu, and navigation.",
    defaults: DEFAULT_CATEGORY_BANNERS[1],
  },
};

const normalizeCustomizationSetting = (res) => {
  if (!res || typeof res !== "object") return { setting: {} };
  if (res.setting && typeof res.setting === "object" && !res.rasaHomepage && !res.navbar) {
    return { setting: res.setting };
  }
  return { setting: res };
};

export const sanitizeCategoryBanners = (banners = []) => {
  const list = Array.isArray(banners) ? banners.filter(Boolean) : [];
  const footwear =
    list.find((b) => b?.type === "footwear") ||
    list.find((b) => b?.slug === "footwear" || /shoe/i.test(b?.title || "")) ||
    DEFAULT_CATEGORY_BANNERS[0];
  const bags =
    list.find((b) => b?.type === "bags") ||
    list.find((b) => b?.slug === "bags" || /bag/i.test(b?.title || "")) ||
    DEFAULT_CATEGORY_BANNERS[1];

  const normalize = (banner, fallback) => ({
    type: banner?.type === "bags" ? "bags" : "footwear",
    title: String(banner?.title ?? fallback.title).trim(),
    slug: String(banner?.slug ?? fallback.slug).trim().toLowerCase(),
    image: String(banner?.image ?? fallback.image).trim(),
  });

  return [
    normalize({ ...footwear, type: "footwear" }, DEFAULT_CATEGORY_BANNERS[0]),
    normalize({ ...bags, type: "bags" }, DEFAULT_CATEGORY_BANNERS[1]),
  ];
};

const useShopCategoryBanners = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryBanners, setCategoryBanners] = useState(DEFAULT_CATEGORY_BANNERS);
  const [categoriesSectionEnabled, setCategoriesSectionEnabled] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await SettingServices.getStoreCustomizationSetting();
      const { setting } = normalizeCustomizationSetting(res);
      const saved = setting?.rasaHomepage || {};
      setCategoryBanners(
        sanitizeCategoryBanners(
          saved.categoryBanners?.length ? saved.categoryBanners : DEFAULT_CATEGORY_BANNERS
        )
      );
      setCategoriesSectionEnabled(saved.categoriesSectionEnabled !== false);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to load shop categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const seedIfEmpty = useCallback(async () => {
    try {
      const res = await SettingServices.getStoreCustomizationSetting();
      const { setting: baseSetting } = normalizeCustomizationSetting(res);
      const saved = baseSetting?.rasaHomepage || {};
      if (saved.categoryBanners?.length >= 2) return;

      const banners = sanitizeCategoryBanners(DEFAULT_CATEGORY_BANNERS);
      await SettingServices.updateStoreCustomizationSetting({
        name: "storeCustomizationSetting",
        setting: {
          ...baseSetting,
          rasaHomepage: { ...saved, categoryBanners: banners },
        },
      });
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      await seedIfEmpty();
      await load();
    })();
  }, [load, seedIfEmpty]);

  const shoesCategory =
    categoryBanners.find((b) => b?.type === "footwear") || CATEGORY_META.footwear.defaults;
  const bagsCategory =
    categoryBanners.find((b) => b?.type === "bags") || CATEGORY_META.bags.defaults;

  const setCategoryByType = (categoryType, field, value) => {
    const defaults = CATEGORY_META[categoryType].defaults;
    const current =
      categoryType === "bags"
        ? { ...defaults, ...bagsCategory, type: "bags" }
        : { ...defaults, ...shoesCategory, type: "footwear" };
    const updated = { ...current, [field]: value, type: categoryType };
    const other =
      categoryType === "bags"
        ? { ...CATEGORY_META.footwear.defaults, ...shoesCategory, type: "footwear" }
        : { ...CATEGORY_META.bags.defaults, ...bagsCategory, type: "bags" };

    setCategoryBanners(categoryType === "bags" ? [other, updated] : [updated, other]);
  };

  const resetCategory = (categoryType) => {
    const defaults = { ...CATEGORY_META[categoryType].defaults };
    const other =
      categoryType === "bags"
        ? { ...CATEGORY_META.footwear.defaults, ...shoesCategory, type: "footwear" }
        : { ...CATEGORY_META.bags.defaults, ...bagsCategory, type: "bags" };

    setCategoryBanners(categoryType === "bags" ? [other, defaults] : [defaults, other]);
  };

  const save = async () => {
    try {
      setSaving(true);
      const res = await SettingServices.getStoreCustomizationSetting();
      const { setting: baseSetting } = normalizeCustomizationSetting(res);
      const banners = sanitizeCategoryBanners(categoryBanners);

      await SettingServices.updateStoreCustomizationSetting({
        name: "storeCustomizationSetting",
        setting: {
          ...baseSetting,
          rasaHomepage: {
            ...(baseSetting.rasaHomepage || {}),
            categoryBanners: banners,
            categoriesSectionEnabled,
          },
        },
      });

      notifySuccess("Shop categories saved");
      await CategoryServices.syncShopCategories({
        categories: sanitizeCategoryBanners(categoryBanners),
      });
      await load();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save shop categories");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    shoesCategory,
    bagsCategory,
    categoriesSectionEnabled,
    setCategoriesSectionEnabled,
    setCategoryByType,
    resetCategory,
    save,
  };
};

export default useShopCategoryBanners;

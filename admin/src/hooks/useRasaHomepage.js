import { useEffect, useState, useCallback } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import SettingServices from "@/services/SettingServices";
import {
  DEFAULT_CATEGORY_BANNERS,
  sanitizeCategoryBanners,
} from "@/hooks/useShopCategoryBanners";

const DEFAULT_FOOTWEAR_HERO = {
  type: "footwear",
  title: "Fresh Drops",
  subtitle: "Fresh Drops",
  description:
    "Affordable sneakers and streetwear — curated picks, delivered to your door.",
  image: "/shoes3.png",
  link: "/search?category=footwear",
  brand: "Rasa",
  bgText: "RASA",
  accentColor: "#D4AF37",
};

const DEFAULT_BAGS_HERO = {
  type: "bags",
  title: "Bags & More",
  subtitle: "Bags & More",
  description:
    "Bags, accessories and latest styles — if you've seen it, chances are we've got it.",
  image: "/bag1.png",
  link: "/search?category=bags",
  brand: "Rasa",
  bgText: "BAGS",
  accentColor: "#B07A4F",
};

const DEFAULT_HOME_REVIEWS = [
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

const DEFAULT_REVIEWS_SECTION = {
  enabled: true,
  eyebrow: "Customer Reviews",
  title: "What Our Customers Say",
  subtitle: "Real feedback from shoppers who bought from Rasa Store.",
};

const DEFAULT_RASA_HOMEPAGE = {
  heroSlides: [DEFAULT_FOOTWEAR_HERO, DEFAULT_BAGS_HERO],
  instagramPosts: [],
  trendingProductIds: [],
  newArrivalProductIds: [],
  categoryBanners: DEFAULT_CATEGORY_BANNERS,
  brandsSectionEnabled: true,
  heroSectionEnabled: true,
  trendingSectionEnabled: true,
  newArrivalsSectionEnabled: true,
  categoriesSectionEnabled: true,
  footerSectionEnabled: true,
  customerReviews: DEFAULT_HOME_REVIEWS,
  reviewsSection: DEFAULT_REVIEWS_SECTION,
  footerIntro:
    "The Rasa Store.\nYour one-stop shop for affordable sneakers, bags, and the latest styles. If you've seen it, chances are we've got it.",
  footer: {
    intro:
      "The Rasa Store.\nYour one-stop shop for affordable sneakers, bags, and the latest styles. If you've seen it, chances are we've got it.",
    whatsapp: "9731308713",
    email: "workwithrasa@gmail.com",
    instagram: "https://www.instagram.com/kicksbyrasaa",
  },
  sectionOrder: ["Hero", "Brands", "New Arrival", "Trending", "Categories", "Reviews"],
};

/** API returns the setting object directly: { navbar, rasaHomepage, ... } */
const normalizeCustomizationSetting = (res) => {
  if (!res || typeof res !== "object") {
    return { setting: {} };
  }
  if (res.setting && typeof res.setting === "object" && !res.rasaHomepage && !res.navbar) {
    return { setting: res.setting };
  }
  return { setting: res };
};

const isBagSlide = (slide = {}) =>
  slide?.type === "bags" ||
  /bag|duffle|backpack/i.test(
    `${slide?.title || ""} ${slide?.subtitle || ""} ${slide?.link || ""} ${slide?.image || ""}`
  );

const isFootwearSlide = (slide = {}) =>
  slide?.type === "footwear" ||
  /footwear|shoe|sneaker/i.test(
    `${slide?.title || ""} ${slide?.subtitle || ""} ${slide?.link || ""} ${slide?.image || ""}`
  );

const sanitizeHeroSlide = (slide, fallback) => ({
  type: slide?.type === "bags" ? "bags" : "footwear",
  title: String(slide?.title ?? fallback.title).trim(),
  subtitle: String(slide?.subtitle ?? fallback.subtitle).trim(),
  description: String(slide?.description ?? slide?.desc ?? fallback.description).trim(),
  image: String(slide?.image ?? fallback.image).trim(),
  link: String(slide?.link ?? fallback.link).trim(),
  brand: String(slide?.brand ?? fallback.brand).trim(),
  bgText: String(slide?.bgText ?? fallback.bgText).trim(),
  accentColor: String(slide?.accentColor ?? fallback.accentColor).trim(),
});

const sanitizeHeroSlides = (slides = []) => {
  const list = Array.isArray(slides) ? slides.filter(Boolean) : [];
  const footwear =
    list.find(isFootwearSlide) ||
    list.find((s) => s?.type !== "bags") ||
    DEFAULT_FOOTWEAR_HERO;
  const bags = list.find(isBagSlide) || DEFAULT_BAGS_HERO;

  return [
    sanitizeHeroSlide({ ...footwear, type: "footwear" }, DEFAULT_FOOTWEAR_HERO),
    sanitizeHeroSlide({ ...bags, type: "bags" }, DEFAULT_BAGS_HERO),
  ];
};

const sanitizeFooter = (footer = {}, legacyIntro = "") => ({
  intro: String(
    footer?.intro ?? legacyIntro ?? DEFAULT_RASA_HOMEPAGE.footer.intro
  ).trim(),
  whatsapp: String(footer?.whatsapp ?? DEFAULT_RASA_HOMEPAGE.footer.whatsapp).trim(),
  email: String(footer?.email ?? DEFAULT_RASA_HOMEPAGE.footer.email).trim(),
  instagram: String(footer?.instagram ?? DEFAULT_RASA_HOMEPAGE.footer.instagram).trim(),
});

const sanitizeCustomerReview = (review = {}) => ({
  name: String(review?.name || "").trim(),
  role: String(review?.role || "").trim(),
  item: String(review?.item || "").trim(),
  rating: Math.min(5, Math.max(1, Number(review?.rating) || 5)),
  comment: String(review?.comment || "").trim(),
  date: String(review?.date || "").trim(),
  avatar: String(review?.avatar || "").trim(),
});

const sanitizeCustomerReviews = (reviews = []) => {
  const list = Array.isArray(reviews) ? reviews : [];
  return list
    .map(sanitizeCustomerReview)
    .filter((review) => review.comment);
};

const sanitizeReviewsSection = (section = {}) => ({
  enabled: section?.enabled !== false,
  eyebrow: String(section?.eyebrow ?? DEFAULT_REVIEWS_SECTION.eyebrow).trim(),
  title: String(section?.title ?? DEFAULT_REVIEWS_SECTION.title).trim(),
  subtitle: String(section?.subtitle ?? DEFAULT_REVIEWS_SECTION.subtitle).trim(),
});

const useRasaHomepage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homepage, setHomepage] = useState(DEFAULT_RASA_HOMEPAGE);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await SettingServices.getStoreCustomizationSetting();
      const { setting } = normalizeCustomizationSetting(res);
      const saved = setting?.rasaHomepage || {};

      setHomepage({
        ...DEFAULT_RASA_HOMEPAGE,
        ...saved,
        categoryBanners: sanitizeCategoryBanners(
          saved.categoryBanners?.length
            ? saved.categoryBanners
            : DEFAULT_RASA_HOMEPAGE.categoryBanners
        ),
        heroSlides: sanitizeHeroSlides(
          saved.heroSlides?.length ? saved.heroSlides : DEFAULT_RASA_HOMEPAGE.heroSlides
        ),
        trendingProductIds: saved.trendingProductIds || [],
        newArrivalProductIds: saved.newArrivalProductIds || [],
        customerReviews: sanitizeCustomerReviews(
          saved.customerReviews?.length
            ? saved.customerReviews
            : DEFAULT_RASA_HOMEPAGE.customerReviews
        ),
        reviewsSection: sanitizeReviewsSection(
          saved.reviewsSection || DEFAULT_RASA_HOMEPAGE.reviewsSection
        ),
        heroSectionEnabled: saved.heroSectionEnabled !== false,
        trendingSectionEnabled: saved.trendingSectionEnabled !== false,
        newArrivalsSectionEnabled: saved.newArrivalsSectionEnabled !== false,
        categoriesSectionEnabled: saved.categoriesSectionEnabled !== false,
        footerSectionEnabled: saved.footerSectionEnabled !== false,
        footer: sanitizeFooter(saved.footer, saved.footerIntro),
      });
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

      const footer = sanitizeFooter(homepage.footer, homepage.footerIntro);
      const categoryBanners = sanitizeCategoryBanners(homepage.categoryBanners);
      const customerReviews = sanitizeCustomerReviews(homepage.customerReviews);
      const reviewsSection = sanitizeReviewsSection(homepage.reviewsSection);
      const rasaHomepage = {
        ...homepage,
        heroSlides: sanitizeHeroSlides(homepage.heroSlides),
        categoryBanners,
        customerReviews,
        reviewsSection,
        footer,
        footerIntro: footer.intro,
      };

      await SettingServices.updateStoreCustomizationSetting({
        name: "storeCustomizationSetting",
        setting: {
          ...baseSetting,
          rasaHomepage,
        },
      });

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

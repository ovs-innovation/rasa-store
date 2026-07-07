import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@windmill/react-ui";
import { FiSave, FiTrash2, FiSearch } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import Loading from "@/components/preloader/Loading";
import Uploader from "@/components/image-uploader/Uploader";
import useRasaHomepage from "@/hooks/useRasaHomepage";
import ProductServices from "@/services/ProductServices";
import SectionVisibilityToggle from "@/components/common/SectionVisibilityToggle";

const HERO_SLIDE_META = {
  footwear: {
    label: "Footwear Hero",
    description: "First hero slide — sneakers & streetwear on the homepage carousel.",
    defaults: {
      type: "footwear",
      title: "Fresh Drops",
      subtitle: "Fresh Drops",
      description:
        "Affordable sneakers and streetwear — curated picks, delivered to your door.",
      image: "/shoes1.png",
      link: "/search?category=footwear",
      brand: "Rasa",
      bgText: "RASA",
      accentColor: "#D4AF37",
    },
  },
  bags: {
    label: "Bags Hero",
    description: "Second hero slide — bags & accessories section on the homepage carousel.",
    defaults: {
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
    },
  },
};

const HeroSlideEditor = ({ slideType, slide, onChange, onReset, onDelete }) => {
  const meta = HERO_SLIDE_META[slideType];

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-900/40">
      <div className="flex justify-between items-center gap-3">
        <div>
          <span className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">
            {meta.label}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 px-2 py-1"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 p-1"
            title="Clear this slide"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Input
          value={slide?.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Title"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
        <Input
          value={slide?.subtitle || ""}
          onChange={(e) => onChange("subtitle", e.target.value)}
          placeholder="Heading (e.g. Bags & More)"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
        <Input
          value={slide?.brand || ""}
          onChange={(e) => onChange("brand", e.target.value)}
          placeholder="Brand label"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
        <Input
          value={slide?.link || ""}
          onChange={(e) => onChange("link", e.target.value)}
          placeholder="Shop link (e.g. /search?category=bags)"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
        <Input
          value={slide?.bgText || ""}
          onChange={(e) => onChange("bgText", e.target.value)}
          placeholder="Background text (e.g. BAGS)"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
        <Input
          value={slide?.accentColor || ""}
          onChange={(e) => onChange("accentColor", e.target.value)}
          placeholder="Accent color (e.g. #B07A4F)"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
          Description
        </label>
        <textarea
          value={slide?.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          placeholder="Short description shown below the heading"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2 outline-none focus:border-teal-500/50"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
          Hero Image
        </label>
        <Uploader
          folder="rasa/hero"
          imageUrl={slide?.image}
          setImageUrl={(url) => onChange("image", url)}
        />
      </div>
    </div>
  );
};

const Section = ({ title, description, enabled, onToggle, children }) => (
  <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {onToggle && (
        <SectionVisibilityToggle
          enabled={enabled}
          onChange={onToggle}
          label="Show on homepage"
        />
      )}
    </div>
    {children}
  </section>
);

const ProductPicker = ({ options, selectedIds, onChange, placeholder }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder || "Search products..."}
          className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-teal-500/50"
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {selectedIds.length} selected
      </p>

      <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            No products found
          </p>
        ) : (
          filtered.map((option) => {
            const checked = selectedIds.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  checked
                    ? "bg-teal-50 dark:bg-teal-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.value)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-500 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {option.label}
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

const RasaHomepage = () => {
  const { loading, saving, homepage, setHomepage, save } = useRasaHomepage();
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    ProductServices.getAllProducts({ page: 1, limit: 200, status: "show" })
      .then((res) => {
        const list = res?.products || res?.data || [];
        setProductOptions(
          list.map((p) => ({
            label: p.title?.en || p.title || p.slug,
            value: p._id,
          }))
        );
      })
      .catch(() => {});
  }, []);

  if (loading) return <Loading loading={loading} />;

  const heroSlides = homepage.heroSlides || [];
  const footwearSlide =
    heroSlides.find((s) => s?.type === "footwear") ||
    heroSlides.find((s) => !/bag|duffle|backpack/i.test(`${s?.link || ""} ${s?.title || ""}`)) ||
    HERO_SLIDE_META.footwear.defaults;
  const bagsSlide =
    heroSlides.find((s) => s?.type === "bags") ||
    heroSlides.find((s) => /bag|duffle|backpack/i.test(`${s?.link || ""} ${s?.title || ""}`)) ||
    HERO_SLIDE_META.bags.defaults;

  const setHeroSlideByType = (slideType, field, value) => {
    const defaults = HERO_SLIDE_META[slideType].defaults;
    const current =
      slideType === "bags"
        ? { ...defaults, ...bagsSlide, type: "bags" }
        : { ...defaults, ...footwearSlide, type: "footwear" };
    const updated = { ...current, [field]: value, type: slideType };
    const other =
      slideType === "bags"
        ? { ...HERO_SLIDE_META.footwear.defaults, ...footwearSlide, type: "footwear" }
        : { ...HERO_SLIDE_META.bags.defaults, ...bagsSlide, type: "bags" };

    setHomepage({
      ...homepage,
      heroSlides: slideType === "bags" ? [other, updated] : [updated, other],
    });
  };

  const resetHeroSlide = (slideType) => {
    const defaults = { ...HERO_SLIDE_META[slideType].defaults };
    const other =
      slideType === "bags"
        ? { ...HERO_SLIDE_META.footwear.defaults, ...footwearSlide, type: "footwear" }
        : { ...HERO_SLIDE_META.bags.defaults, ...bagsSlide, type: "bags" };

    setHomepage({
      ...homepage,
      heroSlides: slideType === "bags" ? [other, defaults] : [defaults, other],
    });
  };

  const clearHeroSlide = (slideType) => {
    const emptySlide = {
      type: slideType,
      title: "",
      subtitle: "",
      description: "",
      image: "",
      link: slideType === "bags" ? "/search?category=bags" : "/search?category=footwear",
      brand: "",
      bgText: "",
      accentColor: "",
    };
    const other =
      slideType === "bags"
        ? { ...HERO_SLIDE_META.footwear.defaults, ...footwearSlide, type: "footwear" }
        : { ...HERO_SLIDE_META.bags.defaults, ...bagsSlide, type: "bags" };

    setHomepage({
      ...homepage,
      heroSlides: slideType === "bags" ? [other, emptySlide] : [emptySlide, other],
    });
  };

  return (
    <>
      <PageTitle>Homepage</PageTitle>

      <AnimatedContent>
        <div className="space-y-6 mb-8">
          <Section
            title="Hero Banner"
            description="Homepage carousel — footwear slide first, then bags slide. Both are saved to the database."
            enabled={homepage.heroSectionEnabled}
            onToggle={() =>
              setHomepage({
                ...homepage,
                heroSectionEnabled: homepage.heroSectionEnabled === false,
              })
            }
          >
            <HeroSlideEditor
              slideType="footwear"
              slide={footwearSlide}
              onChange={(field, value) => setHeroSlideByType("footwear", field, value)}
              onReset={() => resetHeroSlide("footwear")}
              onDelete={() => clearHeroSlide("footwear")}
            />

            <HeroSlideEditor
              slideType="bags"
              slide={bagsSlide}
              onChange={(field, value) => setHeroSlideByType("bags", field, value)}
              onReset={() => resetHeroSlide("bags")}
              onDelete={() => clearHeroSlide("bags")}
            />
          </Section>

          <Section
            title="Trending Products"
            description="Products shown in the Trending section."
            enabled={homepage.trendingSectionEnabled}
            onToggle={() =>
              setHomepage({
                ...homepage,
                trendingSectionEnabled: homepage.trendingSectionEnabled === false,
              })
            }
          >
            <ProductPicker
              options={productOptions}
              selectedIds={homepage.trendingProductIds || []}
              onChange={(ids) =>
                setHomepage({ ...homepage, trendingProductIds: ids })
              }
              placeholder="Search trending products..."
            />
          </Section>

          <Section
            title="New Arrivals"
            description="Products shown in the New Arrivals section."
            enabled={homepage.newArrivalsSectionEnabled}
            onToggle={() =>
              setHomepage({
                ...homepage,
                newArrivalsSectionEnabled: homepage.newArrivalsSectionEnabled === false,
              })
            }
          >
            <ProductPicker
              options={productOptions}
              selectedIds={homepage.newArrivalProductIds || []}
              onChange={(ids) =>
                setHomepage({ ...homepage, newArrivalProductIds: ids })
              }
              placeholder="Search new arrival products..."
            />
          </Section>

          <Section
            title="Footer"
            description="Text and contact info shown at the bottom of every page."
            enabled={homepage.footerSectionEnabled}
            onToggle={() =>
              setHomepage({
                ...homepage,
                footerSectionEnabled: homepage.footerSectionEnabled === false,
              })
            }
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                  About text
                </label>
                <textarea
                  value={homepage.footer?.intro || ""}
                  onChange={(e) =>
                    setHomepage({
                      ...homepage,
                      footer: { ...homepage.footer, intro: e.target.value },
                    })
                  }
                  rows={4}
                  placeholder="Short description under the logo"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2 outline-none focus:border-teal-500/50"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <Input
                  value={homepage.footer?.whatsapp || ""}
                  onChange={(e) =>
                    setHomepage({
                      ...homepage,
                      footer: { ...homepage.footer, whatsapp: e.target.value },
                    })
                  }
                  placeholder="WhatsApp number"
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                />
                <Input
                  value={homepage.footer?.email || ""}
                  onChange={(e) =>
                    setHomepage({
                      ...homepage,
                      footer: { ...homepage.footer, email: e.target.value },
                    })
                  }
                  placeholder="Email"
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                />
                <Input
                  value={homepage.footer?.instagram || ""}
                  onChange={(e) =>
                    setHomepage({
                      ...homepage,
                      footer: { ...homepage.footer, instagram: e.target.value },
                    })
                  }
                  placeholder="Instagram URL"
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>
          </Section>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700 px-8">
            <FiSave className="mr-2" />
            {saving ? "Saving..." : "Save Homepage"}
          </Button>
        </div>
      </AnimatedContent>
    </>
  );
};

export default RasaHomepage;

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button, Input } from "@windmill/react-ui";
import { MultiSelect } from "react-multi-select-component";
import { FiSave, FiExternalLink, FiArrowUp, FiArrowDown } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import Loading from "@/components/preloader/Loading";
import Uploader from "@/components/image-uploader/Uploader";
import useRasaHomepage from "@/hooks/useRasaHomepage";
import ProductServices from "@/services/ProductServices";

const SECTIONS = [
  { path: "/homepage", key: "overview", label: "Overview" },
  { path: "/homepage/hero", key: "hero", label: "Hero Slides" },
  { path: "/homepage/brands", key: "brands", label: "Brands Section" },
  { path: "/homepage/instagram", key: "instagram", label: "Instagram Feed" },
  { path: "/homepage/trending", key: "trending", label: "Trending Products" },
  { path: "/homepage/new-arrivals", key: "newArrivals", label: "New Arrivals" },
  { path: "/homepage/categories", key: "categories", label: "Category Banners" },
  { path: "/homepage/order", key: "order", label: "Section Ordering" },
];

const RasaHomepage = () => {
  const location = useLocation();
  const { loading, saving, homepage, setHomepage, save } = useRasaHomepage();
  const [productOptions, setProductOptions] = useState([]);

  const activeSection = useMemo(() => {
    const match = SECTIONS.find((s) => s.path === location.pathname);
    return match?.key || "overview";
  }, [location.pathname]);

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

  const selectedTrending = productOptions.filter((o) =>
    (homepage.trendingProductIds || []).includes(o.value)
  );
  const selectedNewArrivals = productOptions.filter((o) =>
    (homepage.newArrivalProductIds || []).includes(o.value)
  );

  if (loading) return <Loading loading={loading} />;

  const renderContent = () => {
    switch (activeSection) {
      case "hero":
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Hero scroll animation on the storefront uses shoe images. Update slide copy and fallback images here.
              The live GSAP hero remains code-driven — these settings are for future CMS wiring.
            </p>
            {(homepage.heroSlides || []).map((slide, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
                <Input
                  value={slide.title || ""}
                  onChange={(e) => {
                    const slides = [...homepage.heroSlides];
                    slides[idx] = { ...slides[idx], title: e.target.value };
                    setHomepage({ ...homepage, heroSlides: slides });
                  }}
                  placeholder="Slide title"
                />
                <Input
                  value={slide.subtitle || ""}
                  onChange={(e) => {
                    const slides = [...homepage.heroSlides];
                    slides[idx] = { ...slides[idx], subtitle: e.target.value };
                    setHomepage({ ...homepage, heroSlides: slides });
                  }}
                  placeholder="Subtitle"
                />
                <Input
                  value={slide.link || ""}
                  onChange={(e) => {
                    const slides = [...homepage.heroSlides];
                    slides[idx] = { ...slides[idx], link: e.target.value };
                    setHomepage({ ...homepage, heroSlides: slides });
                  }}
                  placeholder="Link (e.g. /search)"
                />
              </div>
            ))}
          </div>
        );

      case "brands":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Brand logos and names are managed in the Brands module. Homepage shows all active brands.
            </p>
            <Link to="/brands" className="inline-flex items-center gap-2 text-[#008f89] font-semibold">
              Manage Brands <FiExternalLink />
            </Link>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={homepage.brandsSectionEnabled !== false}
                onChange={(e) =>
                  setHomepage({ ...homepage, brandsSectionEnabled: e.target.checked })
                }
              />
              Show &quot;Shop By Brand&quot; section on homepage
            </label>
          </div>
        );

      case "instagram":
        return (
          <div className="space-y-4">
            {(homepage.instagramPosts || []).map((post, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-white dark:bg-gray-800 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Post URL</label>
                  <Input
                    value={post.url || ""}
                    onChange={(e) => {
                      const posts = [...homepage.instagramPosts];
                      posts[idx] = { ...posts[idx], url: e.target.value };
                      setHomepage({ ...homepage, instagramPosts: posts });
                    }}
                    placeholder="https://instagram.com/p/..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Image</label>
                  <Uploader
                    folder="rasa/instagram"
                    imageUrl={post.image}
                    setImageUrl={(url) => {
                      const posts = [...homepage.instagramPosts];
                      posts[idx] = { ...posts[idx], image: url };
                      setHomepage({ ...homepage, instagramPosts: posts });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "trending":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Pick products for the Trending section. You can also tag products with &quot;Trending Product&quot; on the Add Product form.
            </p>
            <MultiSelect
              options={productOptions}
              value={selectedTrending}
              onChange={(selected) =>
                setHomepage({
                  ...homepage,
                  trendingProductIds: selected.map((s) => s.value),
                })
              }
              labelledBy="Select trending products"
            />
          </div>
        );

      case "newArrivals":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Pick products for New Arrivals. You can also tag products with &quot;New Arrival&quot; on the Add Product form.
            </p>
            <MultiSelect
              options={productOptions}
              value={selectedNewArrivals}
              onChange={(selected) =>
                setHomepage({
                  ...homepage,
                  newArrivalProductIds: selected.map((s) => s.value),
                })
              }
              labelledBy="Select new arrival products"
            />
          </div>
        );

      case "categories":
        return (
          <div className="space-y-4">
            {(homepage.categoryBanners || []).map((banner, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-white dark:bg-gray-800 grid md:grid-cols-3 gap-4">
                <Input
                  value={banner.title || ""}
                  onChange={(e) => {
                    const banners = [...homepage.categoryBanners];
                    banners[idx] = { ...banners[idx], title: e.target.value };
                    setHomepage({ ...homepage, categoryBanners: banners });
                  }}
                  placeholder="Title"
                />
                <Input
                  value={banner.slug || ""}
                  onChange={(e) => {
                    const banners = [...homepage.categoryBanners];
                    banners[idx] = { ...banners[idx], slug: e.target.value };
                    setHomepage({ ...homepage, categoryBanners: banners });
                  }}
                  placeholder="Category slug"
                />
                <Uploader
                  folder="rasa/categories"
                  imageUrl={banner.image}
                  setImageUrl={(url) => {
                    const banners = [...homepage.categoryBanners];
                    banners[idx] = { ...banners[idx], image: url };
                    setHomepage({ ...homepage, categoryBanners: banners });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case "order": {
        const currentOrder = homepage.sectionOrder || ["Hero", "Brands", "New Arrival", "Trending", "Categories", "Instagram", "Newsletter"];
        const moveSection = (index, direction) => {
          const newOrder = [...currentOrder];
          const targetIndex = index + direction;
          if (targetIndex < 0 || targetIndex >= newOrder.length) return;
          const temp = newOrder[index];
          newOrder[index] = newOrder[targetIndex];
          newOrder[targetIndex] = temp;
          setHomepage({ ...homepage, sectionOrder: newOrder });
        };
        return (
          <div className="space-y-4 max-w-xl">
            <p className="text-sm text-gray-500 mb-2">
              Homepage display sequence: click the Up/Down arrows below to re-arrange the section order on the frontend.
            </p>
            <div className="divide-y border rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 overflow-hidden">
              {currentOrder.map((sec, idx) => (
                <div key={sec} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{sec}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, -1)}
                      className={`p-2 rounded-lg transition-colors ${
                        idx === 0
                          ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <FiArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === currentOrder.length - 1}
                      onClick={() => moveSection(idx, 1)}
                      className={`p-2 rounded-lg transition-colors ${
                        idx === currentOrder.length - 1
                          ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <FiArrowDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {SECTIONS.filter((s) => s.key !== "overview").map((s) => (
              <Link
                key={s.path}
                to={s.path}
                className="block p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#D4AF37] transition-colors"
              >
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{s.label}</h3>
                <p className="text-xs text-gray-500 mt-1">Configure {s.label.toLowerCase()}</p>
              </Link>
            ))}
          </div>
        );
    }
  };

  return (
    <>
      <PageTitle>RASA Homepage Manager</PageTitle>
      <AnimatedContent>
        <div className="flex flex-wrap gap-2 mb-6">
          {SECTIONS.map((s) => (
            <Link
              key={s.path}
              to={s.path}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                activeSection === s.key
                  ? "bg-[#050505] text-[#D4AF37] border-[#D4AF37]"
                  : "bg-white dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
          {renderContent()}
        </div>

        {activeSection !== "overview" && (
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="bg-[#008f89]">
              <FiSave className="mr-2" />
              {saving ? "Saving..." : "Save Homepage"}
            </Button>
          </div>
        )}
      </AnimatedContent>
    </>
  );
};

export default RasaHomepage;

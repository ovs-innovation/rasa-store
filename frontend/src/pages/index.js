import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBack, IoChevronForward, IoSparkles, IoArrowForwardOutline } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import HeroBanner from "@components/banner/HeroBanner";
import AttributeServices from "@services/AttributeServices";
import BrandServices from "@services/BrandServices";
import SectionHeader from "@components/common/SectionHeader";
import ShopByBrandSection from "@components/brand/ShopByBrandSection";
import NewsletterSection from "@components/newsletter/NewsletterSection";
import CustomerReviewSection from "@components/review/CustomerReviewSection";

const Home = ({ popularProducts, discountProducts, bestSellingProducts, attributes, brands, rasaHomepage }) => {
  const newArrivals = popularProducts || [];
  const trendingProducts = bestSellingProducts || [];

  const ALLOWED_CATEGORIES = ["shoes", "bags", "shoe", "bag", "sneakers", "footwear"];
  const categories = (rasaHomepage?.categoryBanners || [])
    .filter((cat) => {
      if (!cat?.title || !cat?.image) return false;
      const titleLower = cat.title.toLowerCase();
      return ALLOWED_CATEGORIES.some((allowed) => titleLower.includes(allowed));
    })
    .slice(0, 2)
    .map((cat, idx) => ({
      id: cat.id || `cat-${idx}`,
      title: cat.title,
      image: cat.image,
      slug: cat.slug || "footwear",
    }));

  // Fallback static categories if DB doesn't have matching ones
  const displayCategories = categories.length > 0 ? categories : [
    { id: "cat-shoes", title: "Shoes", image: "/uploads/shoes-category.jpg", slug: "footwear" },
    { id: "cat-bags", title: "Bags", image: "/uploads/bags-category.jpg", slug: "bags" },
  ];

  const renderProductCarousel = (products, prevClass, nextClass) => (
    <div className="relative group px-2">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={15}
        slidesPerView={2}
        loop={products.length >= 5}
        navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="mySwiper !pb-8 !pt-2"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCard product={product} attributes={attributes} />
          </SwiperSlide>
        ))}
      </Swiper>
      <button className={`${prevClass} absolute top-1/2 -left-3 z-10 bg-[#111111] shadow-lg border border-neutral-800 rounded-full p-2.5 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/40 transition-colors transform -translate-y-1/2`}>
        <IoChevronBack className="text-lg text-white" />
      </button>
      <button className={`${nextClass} absolute top-1/2 -right-3 z-10 bg-[#111111] shadow-lg border border-neutral-800 rounded-full p-2.5 hover:bg-[#1a1a1a] hover:border-[#D4AF37]/40 transition-colors transform -translate-y-1/2`}>
        <IoChevronForward className="text-lg text-white" />
      </button>
    </div>
  );

  const defaultSectionOrder = ["Hero", "Brands", "Categories", "New Arrival", "Trending", "Newsletter"];
  const baseOrder = (rasaHomepage?.sectionOrder || defaultSectionOrder).filter(
    (section) => section !== "Instagram" && section !== "Newsletter"
  );
  // Force Categories to always sit right after Brands
  const reorderedSectionOrder = (() => {
    const arr = baseOrder.filter((s) => s !== "Categories");
    const brandsIdx = arr.indexOf("Brands");
    if (brandsIdx !== -1) {
      arr.splice(brandsIdx + 1, 0, "Categories");
    } else {
      arr.unshift("Categories");
    }
    return arr;
  })();

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case "Hero":
        return <HeroBanner key="Hero" />;
      case "Brands":
        return (
          <ShopByBrandSection
            key="Brands"
            brands={brands}
            enabled={rasaHomepage?.brandsSectionEnabled !== false}
          />
        );
      case "New Arrival":
        return newArrivals.length > 0 && (
          <section key="New Arrival" className="py-8 md:py-16 mx-auto max-w-screen-2xl px-4 sm:px-8">
            <div className="flex justify-between items-center mb-6 w-full gap-4 border-b border-neutral-900/60 pb-3">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0F0F0F] border border-neutral-800 text-[#D4AF37] text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full mb-2">
                  <IoSparkles className="text-[#D4AF37]" />
                  <span>Fresh In</span>
                </div>
                <SectionHeader
                  title="New Arrivals"
                  subtitle="Latest authenticated sneakers, bags, and streetwear essentials"
                  align="left"
                  className="mb-0"
                />
              </div>
              <Link
                href="/new-arrivals"
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F0F0F] border border-neutral-800 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-widest text-neutral-300 hover:text-white hover:border-[#D4AF37] transition-all shrink-0"
              >
                <span>View All</span>
                <IoChevronForward className="transition-transform group-hover:translate-x-0.5 text-[#D4AF37] text-[10px] sm:text-xs" />
              </Link>
            </div>
            {renderProductCarousel(newArrivals, "prev-new-arrivals", "next-new-arrivals")}
          </section>
        );
      case "Trending":
        return trendingProducts.length > 0 && (
          <section key="Trending" className="py-8 md:py-16 bg-[#F3F3F3] border-y border-neutral-200/60 text-black font-sans">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
              <div className="flex justify-between items-center mb-6 w-full gap-4 border-b border-neutral-200/60 pb-3">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200/60 text-[#D4AF37] text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span>Most Wanted</span>
                  </div>
                  <SectionHeader
                    title="Trending Products"
                    subtitle="This week's best-selling sneakers and streetwear favorites"
                    align="left"
                    className="mb-0 text-black"
                  />
                </div>
                <Link
                  href="/trending"
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200/65 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-widest text-neutral-700 hover:text-black hover:border-black transition-all shrink-0"
                >
                  <span>Explore All</span>
                  <IoChevronForward className="transition-transform group-hover:translate-x-0.5 text-[#D4AF37] text-[10px] sm:text-xs" />
                </Link>
              </div>
              {renderProductCarousel(trendingProducts, "prev-trending", "next-trending")}
            </div>
          </section>
        );
      case "Categories":
        return displayCategories.length > 0 ? (
          <section key="Categories" className="w-full bg-[#050505] font-sans pb-4">
            {/* Mobile-optimized Section Header */}
            <div className="max-w-screen-2xl mx-auto px-6 pt-8 pb-4 md:hidden">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-[0.15em] text-white">
                    Shop By Category
                  </h2>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mt-1.5 max-w-[260px]">
                    Curated footwear and streetwear essentials authenticated for your daily rotation.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#111111] border border-neutral-800 flex items-center justify-center text-[#D4AF37] shrink-0 ml-4 active:scale-95 transition-transform">
                  <IoArrowForwardOutline className="text-lg" />
                </div>
              </div>
            </div>

            {/* Desktop Section label */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 pt-6 pb-3 md:pt-10 md:pb-5 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Shop By Category</span>
                <div className="h-px flex-1 bg-neutral-800" />
              </div>
            </div>

            {/* Full-width side-by-side panels */}
            <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[340px]">
              {displayCategories.map((cat, idx) => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="group relative flex-1 overflow-hidden"
                  style={{ minHeight: "170px" }}
                >
                  {/* Background image */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/55 group-hover:bg-black/40 transition-colors duration-500" />

                  {/* Gold side accent line */}
                  <div
                    className={`absolute top-0 bottom-0 w-[2px] bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${idx === 0 ? "right-0" : "left-0"}`}
                  />

                  {/* Content — centered */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                    {/* Category number */}
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/70">
                      0{idx + 1}
                    </span>

                    {/* Title */}
                    <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white leading-none group-hover:text-[#D4AF37] transition-colors duration-300">
                      {cat.title}
                    </h3>

                    {/* Animated CTA */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
                      <div className="h-px w-6 bg-[#D4AF37]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Shop Now</span>
                      <div className="h-px w-6 bg-[#D4AF37]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pb-2" />
          </section>
        ) : null;
      case "Newsletter":
        return <NewsletterSection key="Newsletter" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#050505]">
        {reorderedSectionOrder.map((section) => renderSection(section))}
        <CustomerReviewSection />
      </div>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const [dataResult, attributesResult, brandsResult] = await Promise.allSettled([
    ProductServices.getShowingStoreProducts({}),
    AttributeServices.getShowingAttributes(),
    BrandServices.getShowingBrands(),
  ]);

  const data = dataResult.status === "fulfilled" ? dataResult.value : null;
  const attributes = attributesResult.status === "fulfilled" ? attributesResult.value : [];
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value : [];
  const rasaHomepage = data?.rasaHomepage || null;

  return {
    props: {
      attributes: attributes || [],
      popularProducts: data?.popularProducts || [],
      discountProducts: data?.discountedProducts || [],
      bestSellingProducts: data?.bestSellingProducts || [],
      brands: brands || [],
      rasaHomepage,
    },
    revalidate: 30,
  };
};

export default Home;

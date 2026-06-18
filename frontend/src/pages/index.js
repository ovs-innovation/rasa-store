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

const Home = ({ popularProducts, discountProducts, bestSellingProducts, attributes, brands, rasaHomepage }) => {
  const newArrivals = popularProducts || [];
  const trendingProducts = bestSellingProducts || [];

  const categories = (rasaHomepage?.categoryBanners || [])
    .filter((cat) => cat?.title && cat?.image)
    .map((cat, idx) => ({
      id: cat.id || `cat-${idx}`,
      title: cat.title,
      image: cat.image,
      slug: cat.slug || "footwear",
    }));

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

  const defaultSectionOrder = ["Hero", "Brands", "New Arrival", "Trending", "Categories", "Newsletter"];
  const currentSectionOrder = (rasaHomepage?.sectionOrder || defaultSectionOrder).filter(
    (section) => section !== "Instagram"
  );

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
          <section key="New Arrival" className="py-16 mx-auto max-w-screen-2xl px-4 sm:px-8">
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
          <section key="Trending" className="py-16 bg-[#F3F3F3] border-y border-neutral-200/60 text-black font-sans">
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
        return categories.length > 0 ? (
          <section key="Categories" className="py-16 mx-auto max-w-screen-2xl px-4 sm:px-8">
            <div className="mb-8">
              <SectionHeader
                title="Shop By Category"
                subtitle="Sneakers, bags, slides, and accessories curated for the RASA edit"
                align="left"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.5)] block hover:border-[#D4AF37]/40 transition-all duration-500"
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-left">
                    <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {cat.title}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-300">
                      <span>Explore Drop</span>
                      <IoArrowForwardOutline className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
        {currentSectionOrder.map((section) => renderSection(section))}
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
